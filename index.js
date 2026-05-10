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

// ---- Health check ----
app.get('/', (req, res) => res.send('BullyStop Bot is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
