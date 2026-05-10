// ============================================================
//  sheets.js — บันทึกข้อมูลลง Google Sheets อัตโนมัติ
//  ต้องสร้าง Google Apps Script ก่อน (ดูวิธีใน README.md)
// ============================================================

const axios = require('axios');

const SHEETS_URL = process.env.GOOGLE_SHEETS_URL; // URL จาก Apps Script

async function post(payload) {
  if (!SHEETS_URL) {
    console.log('[Sheets] No URL configured, skipping:', payload);
    return;
  }
  try {
    await axios.post(SHEETS_URL, payload, { timeout: 5000 });
  } catch (err) {
    console.error('[Sheets] Error:', err.message);
  }
}

// ---- บันทึกการกระทำทั่วไป ----
async function logAction(userId, action, detail) {
  await post({
    sheet : 'Log',
    userId,
    action,
    detail,
    timestamp: new Date().toISOString(),
  });
}

// ---- บันทึกคำตอบการ์ดบูลลี่ ----
async function logAnswer(userId, cardId, choice, score) {
  await post({
    sheet    : 'Answers',
    userId,
    cardId,
    choice,
    score,
    timestamp: new Date().toISOString(),
  });
}

// ---- บันทึกผล Pre-test ----
async function logPretest(userId, score) {
  await post({
    sheet    : 'TestResults',
    userId,
    type     : 'pretest',
    score,
    timestamp: new Date().toISOString(),
  });
}

// ---- บันทึกผล Post-test ----
async function logPosttest(userId, score) {
  await post({
    sheet    : 'TestResults',
    userId,
    type     : 'posttest',
    score,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { logAction, logAnswer, logPretest, logPosttest };
