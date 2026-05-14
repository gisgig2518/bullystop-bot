// ============================================================
//  BullyStop Bot — index.js  (Entry Point)
//  LINE Chatbot + AI สำหรับโครงงาน BullyStop
//  ติดตั้ง: npm install express @line/bot-sdk axios dotenv
// ============================================================

require('dotenv').config();
const express  = require('express');
const line     = require('@line/bot-sdk');
const handlers = require('./handlers');

const config = {
  channelAccessToken : process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret      : process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app    = express();

// ---- Webhook endpoint ----
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(
      req.body.events.map(event => handlers.handleEvent(event, client))
    );
    res.json(results);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// ---- Health check (สำหรับ UptimeRobot ping) ----
app.get('/', (req, res) => res.send('BullyStop Bot is running! ✅'));
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BullyStop Bot',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // ---- Self-ping ทุก 14 นาที ป้องกัน Render Sleep ----
  const https = require('https');
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://bullystop-bot.onrender.com';
  setInterval(() => {
    https.get(`${SELF_URL}/health`, (res) => {
      console.log(`🏓 Self-ping: ${res.statusCode} — ${new Date().toLocaleTimeString('th-TH')}`);
    }).on('error', (err) => {
      console.error('Self-ping error:', err.message);
    });
  }, 14 * 60 * 1000); // 14 นาที
});
