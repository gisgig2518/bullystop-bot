// ============================================================
//  google-apps-script.js
//  วางโค้ดนี้ใน Google Apps Script (Extensions → Apps Script)
//  แล้ว Deploy เป็น Web App เพื่อรับข้อมูลจาก Bot
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.getActiveSpreadsheet();

    if (data.sheet === 'Log') {
      writeRow(ss, 'Log', [
        data.timestamp,
        data.userId,
        data.action,
        data.detail,
      ]);
    }

    if (data.sheet === 'Answers') {
      writeRow(ss, 'Answers', [
        data.timestamp,
        data.userId,
        data.cardId,
        data.choice,
        data.score,
      ]);
      updateSummary(ss, data.userId, data.score);
    }

    if (data.sheet === 'TestResults') {
      writeRow(ss, 'TestResults', [
        data.timestamp,
        data.userId,
        data.type,
        data.score,
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeRow(ss, sheetName, values) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // เพิ่มหัวตาราง
    const headers = {
      'Log'        : ['Timestamp','UserID','Action','Detail'],
      'Answers'    : ['Timestamp','UserID','CardID','Choice','Score'],
      'TestResults': ['Timestamp','UserID','Type','Score'],
      'Summary'    : ['UserID','TotalScore','AnswerCount','LastUpdated'],
    };
    if (headers[sheetName]) {
      sheet.appendRow(headers[sheetName]);
      sheet.getRange(1, 1, 1, headers[sheetName].length)
        .setFontWeight('bold')
        .setBackground('#D9E2F3');
    }
  }
  sheet.appendRow(values);
}

function updateSummary(ss, userId, newScore) {
  let sheet = ss.getSheetByName('Summary');
  if (!sheet) {
    sheet = ss.insertSheet('Summary');
    sheet.appendRow(['UserID','TotalScore','AnswerCount','LastUpdated']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#D9E2F3');
  }

  const data    = sheet.getDataRange().getValues();
  let   rowIdx  = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) { rowIdx = i + 1; break; }
  }

  const now = new Date().toISOString();
  if (rowIdx > 0) {
    const currentTotal = sheet.getRange(rowIdx, 2).getValue();
    const currentCount = sheet.getRange(rowIdx, 3).getValue();
    sheet.getRange(rowIdx, 2).setValue(currentTotal + newScore);
    sheet.getRange(rowIdx, 3).setValue(currentCount + 1);
    sheet.getRange(rowIdx, 4).setValue(now);
  } else {
    sheet.appendRow([userId, newScore, 1, now]);
  }
}

// ดู Sheet URL ใน console เพื่อ debug
function setup() {
  Logger.log('Spreadsheet URL: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}
