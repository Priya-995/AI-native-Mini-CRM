const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send', async (req: any, res: any) => {
  const { communicationId, recipient, message, channel, callbackUrl } = req.body;

  console.log(`📤 Queued: ${communicationId} via ${channel} to ${recipient}`);
  
  // Immediately acknowledge
  res.json({ queued: true, communicationId });

  // Simulate real-world async delivery (2-10 seconds delay)
  const delay = 2000 + Math.random() * 8000;
  
  setTimeout(async () => {
    const r = Math.random();
    const status = r < 0.05 ? 'failed'
      : r < 0.40 ? 'delivered'
      : r < 0.70 ? 'read'
      : 'clicked';

    console.log(`📬 Callback: ${communicationId} → ${status}`);

    try {
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communicationId, status })
      });
    } catch (err) {
      console.error('Callback failed:', err);
    }
  }, delay);
});

app.get('/health', (req: any, res: any) => {
  res.json({ ok: true, service: 'channel-service' });
});

app.listen(3001, () => console.log('✅ Channel Service running on port 3001'));