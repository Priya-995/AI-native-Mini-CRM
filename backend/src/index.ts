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
// ─── AI ROUTES ───────────────────────────────────────────
app.post('/ai/generate-message', async (req: any, res: any) => {
  const { segment, channel } = req.body;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Write a short ${channel} marketing message for a ${segment} customer segment of an Indian fashion/lifestyle brand. Under 160 chars, friendly, with CTA. Just the message text.` }],
      max_tokens: 200,
    })
  });
  const data = await response.json() as any;
  res.json({ message: data.choices[0].message.content.trim() });
});

app.post('/ai/copilot', async (req: any, res: any) => {
  const { messages, customerStats } = req.body;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `You are Xeno Copilot, an AI assistant for a CRM marketing platform used by Indian consumer brands. You help marketing managers understand their customers, build segments, and draft campaigns. Current data: ${JSON.stringify(customerStats)}. Be concise, actionable, and use ₹ for currency.` },
        ...messages
      ],
      max_tokens: 500,
    })
  });
  const data = await response.json() as any;
  res.json({ reply: data.choices[0].message.content.trim() });
});

app.post('/ai/segment', async (req: any, res: any) => {
  const { query } = req.body;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Convert this CRM query to JSON filters. Available fields: segment (vip/loyal/at-risk/new/lapsed), city, preferred_channel (whatsapp/sms/email/rcs), min_spend, max_spend, min_orders, max_orders. Query: "${query}". Respond ONLY with JSON like {"segment":"vip","min_spend":10000}` }],
      max_tokens: 200,
    })
  });
  const data = await response.json() as any;
  try {
    const filters = JSON.parse(data.choices[0].message.content.trim());
    // Apply filters to get matching customers
    let query2 = supabase.from('customers').select('*');
    if (filters.segment) query2 = query2.eq('segment', filters.segment);
    if (filters.city) query2 = query2.eq('city', filters.city);
    if (filters.preferred_channel) query2 = query2.eq('preferred_channel', filters.preferred_channel);
    if (filters.min_spend) query2 = query2.gte('total_spend', filters.min_spend);
    if (filters.max_spend) query2 = query2.lte('total_spend', filters.max_spend);
    if (filters.min_orders) query2 = query2.gte('total_orders', filters.min_orders);
    if (filters.max_orders) query2 = query2.lte('total_orders', filters.max_orders);
    const { data: customers } = await query2;
    res.json({ filters, customers, count: customers?.length || 0 });
  } catch {
    res.json({ filters: {}, customers: [], count: 0 });
  }
});

// ─── DASHBOARD STATS ─────────────────────────────────────
app.get('/stats', async (req: any, res: any) => {
  const { data: customers } = await supabase.from('customers').select('id, segment, total_spend');
  const { data: campaigns } = await supabase.from('campaigns').select('sent, delivered, opened, clicked, status');
  
  const totalCustomers = customers?.length || 0;
  const totalRevenue = customers?.reduce((sum: number, c: any) => sum + (c.total_spend || 0), 0) || 0;
  const totalSent = campaigns?.reduce((sum: number, c: any) => sum + (c.sent || 0), 0) || 0;
  const totalOpened = campaigns?.reduce((sum: number, c: any) => sum + (c.opened || 0), 0) || 0;
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0;

  res.json({ totalCustomers, totalRevenue, totalSent, avgOpenRate, activeCampaigns });
});
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const upload = multer({ storage: multer.memoryStorage() });


app.post('/customers/import', upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const filename = req.file.originalname.toLowerCase();
  let records: any[] = [];

  try {
    if (filename.endsWith('.csv')) {
      records = parse(req.file.buffer.toString(), {
        columns: true, skip_empty_lines: true, trim: true,
      });
    } else if (filename.endsWith('.json')) {
      records = JSON.parse(req.file.buffer.toString());
      if (!Array.isArray(records)) throw new Error('JSON must be an array of objects');
    } else {
      return res.status(400).json({ error: 'Only .csv and .json files are supported' });
    }

    const rows = records.map((r: any) => ({
      id: r.id || `c_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      city: r.city || '',
      total_orders: parseInt(r.total_orders || '0'),
      total_spend: parseFloat(r.total_spend || '0'),
      last_order_date: r.last_order_date || null,
      segment: r.segment || 'new',
      preferred_channel: r.preferred_channel || 'whatsapp',
      join_date: r.join_date || new Date().toISOString().split('T')[0],
      rfm_r: parseInt(r.rfm_r || '3'),
      rfm_f: parseInt(r.rfm_f || '3'),
      rfm_m: parseInt(r.rfm_m || '3'),
    }));

    const { error } = await supabase.from('customers').upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, imported: rows.length });

  } catch (err: any) {
    res.status(400).json({ error: 'Import failed: ' + err.message });
  }
});
app.get('/customers/:id/orders', async (req: any, res: any) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', req.params.id)
    .order('order_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post('/ai/campaign-insight', async (req: any, res: any) => {
  const { campaign } = req.body;
  const deliveryRate = campaign.sent > 0 ? ((campaign.delivered / campaign.sent) * 100).toFixed(1) : 0;
  const clickRate = campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Summarize this campaign in 2-3 sentences for a marketing manager. Be specific with numbers and give one actionable recommendation.
Campaign: ${campaign.name}
Channel: ${campaign.channel}, Segment: ${campaign.segment_filter}
Sent: ${campaign.sent}, Delivered: ${campaign.delivered} (${deliveryRate}%), Read: ${campaign.opened}, Clicked: ${campaign.clicked} (${clickRate}%)` }],
      max_tokens: 200,
    })
  });
  const data = await response.json() as any;
  res.json({ insight: data.choices[0].message.content.trim() });
});
app.post('/orders/import', upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const filename = req.file.originalname.toLowerCase();
  let records: any[] = [];

  try {
    if (filename.endsWith('.csv')) {
      records = parse(req.file.buffer.toString(), {
        columns: true, skip_empty_lines: true, trim: true,
      });
    } else if (filename.endsWith('.json')) {
      records = JSON.parse(req.file.buffer.toString());
      if (!Array.isArray(records)) throw new Error('JSON must be an array');
    } else {
      return res.status(400).json({ error: 'Only .csv and .json supported' });
    }

    const rows = records.map((r: any) => ({
      id: r.id || `o_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      customer_id: r.customer_id,
      amount: parseFloat(r.amount || '0'),
      items: r.items || '',
      status: r.status || 'completed',
      order_date: r.order_date || new Date().toISOString().split('T')[0],
    }));

    const { error } = await supabase.from('orders').upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, imported: rows.length });

  } catch (err: any) {
    res.status(400).json({ error: 'Import failed: ' + err.message });
  }
});
app.listen(3000, () => console.log('✅ CRM Backend running on port 3000'));
export {};