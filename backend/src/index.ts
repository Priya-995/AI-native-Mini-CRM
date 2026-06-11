const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:3001';
const CRM_URL = process.env.CRM_URL || 'http://localhost:3000';

// ─── CUSTOMERS ───────────────────────────────────────────
app.get('/customers', async (req: any, res: any) => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── CAMPAIGNS ───────────────────────────────────────────
app.get('/campaigns', async (req: any, res: any) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/campaigns', async (req: any, res: any) => {
  const { name, message, channel, segment_filter } = req.body;
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ name, message, channel, segment_filter, status: 'draft' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── LAUNCH CAMPAIGN ─────────────────────────────────────
app.post('/campaigns/:id/launch', async (req: any, res: any) => {
  const { id } = req.params;

  // 1. Get campaign
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();
  if (campErr) return res.status(404).json({ error: 'Campaign not found' });

  // 2. Get matching customers based on segment_filter
  let query = supabase.from('customers').select('*');
  if (campaign.segment_filter && campaign.segment_filter !== 'all') {
    query = query.eq('segment', campaign.segment_filter);
  }
  const { data: customers, error: custErr } = await query;
  if (custErr) return res.status(500).json({ error: custErr.message });

  // 3. Create communication rows (status: sent)
  const communications = customers.map((c: any) => ({
    campaign_id: id,
    customer_id: c.id,
    status: 'sent',
    channel: campaign.channel,
    message: campaign.message
  }));

  const { error: commErr } = await supabase
    .from('communications')
    .insert(communications);
  if (commErr) return res.status(500).json({ error: commErr.message });

  // 4. Update campaign status to active + sent count
  await supabase
    .from('campaigns')
    .update({ status: 'active', sent: customers.length })
    .eq('id', id);

  // 5. Call channel service for each communication
  const { data: insertedComms } = await supabase
    .from('communications')
    .select('*')
    .eq('campaign_id', id);

  // Fire and forget - don't await
  insertedComms?.forEach((comm: any) => {
    fetch(`${CHANNEL_SERVICE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communicationId: comm.id,
        recipient: comm.customer_id,
        message: comm.message,
        channel: comm.channel,
        callbackUrl: `${CRM_URL}/receipt`
      })
    }).catch(console.error);
  });

  res.json({ 
    success: true, 
    campaignId: id,
    totalSent: customers.length 
  });
});

// ─── RECEIPT (channel service calls this back) ────────────
app.post('/receipt', async (req: any, res: any) => {
  const { communicationId, status } = req.body;

  // Update communication status
  const { error } = await supabase
    .from('communications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', communicationId);

  if (error) return res.status(500).json({ error: error.message });

  // Update campaign stats
  const { data: comm } = await supabase
    .from('communications')
    .select('campaign_id')
    .eq('id', communicationId)
    .single();

  if (comm) {
    const { data: allComms } = await supabase
      .from('communications')
      .select('status')
      .eq('campaign_id', comm.campaign_id);

    if (allComms) {
      const stats = allComms.reduce((acc: any, c: any) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});

      await supabase
        .from('campaigns')
        .update({
          delivered: stats.delivered || 0,
          opened: stats.read || 0,
          clicked: stats.clicked || 0,
        })
        .eq('id', comm.campaign_id);
    }
  }

  res.json({ ok: true });
});

// ─── CAMPAIGN STATS ───────────────────────────────────────
app.get('/campaigns/:id/stats', async (req: any, res: any) => {
  const { id } = req.params;

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  const { data: comms } = await supabase
    .from('communications')
    .select('status, customer_id')
    .eq('campaign_id', id);

  res.json({ campaign, communications: comms });
});

app.listen(3000, () => console.log('✅ CRM Backend running on port 3000'));
export {};