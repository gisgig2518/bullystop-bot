# BullyStop Bot — คู่มือติดตั้งฉบับสมบูรณ์

นวัตกรรมเกม AI ต้านการบูลลี่ผ่าน LINE Chatbot
โครงงาน: BullyStop : นวัตกรรมเกม AI ต้านการบูลลี่ผ่าน LINE

---

## โครงสร้างไฟล์

```
bullystop-bot/
├── index.js              ← เซิร์ฟเวอร์หลัก (เริ่มต้นที่นี่)
├── handlers.js           ← รับ Event จาก LINE แล้วส่งต่อ
├── game.js               ← ข้อมูลการ์ดและ Logic เกม
├── flex.js               ← สร้างข้อความและปุ่มสำหรับ LINE
├── ai.js                 ← เชื่อมต่อ Claude AI
├── sheets.js             ← บันทึกข้อมูลลง Google Sheets
├── google-apps-script.js ← โค้ดสำหรับวางใน Google Apps Script
├── package.json          ← รายการ dependencies
└── .env.example          ← ตัวอย่างไฟล์ตั้งค่า
```

---

## ขั้นตอนการติดตั้ง (ทำตามลำดับ)

### ขั้นที่ 1 — สมัคร LINE Official Account

1. ไปที่ https://manager.line.biz
2. กด "สร้างบัญชีใหม่" → เลือก LINE Official Account ฟรี
3. ตั้งชื่อ: BullyStop Bot → หมวดหมู่: การศึกษา
4. ไปที่ "Messaging API" → กด Enable
5. คัดลอก Channel Secret และ Channel Access Token เก็บไว้

### ขั้นที่ 2 — ตั้งค่า Google Sheets

1. สร้าง Google Sheets ใหม่
2. เปิด Extensions → Apps Script
3. วางโค้ดจากไฟล์ google-apps-script.js ทั้งหมด
4. กด Deploy → New Deployment → Web App
5. Execute as: Me | Who has access: Anyone → กด Deploy
6. คัดลอก Web App URL เก็บไว้

### ขั้นที่ 3 — Deploy Bot บน Render (ฟรี)

1. สมัครที่ https://render.com
2. กด New → Web Service → Connect GitHub (อัปโหลดโค้ดขึ้น GitHub ก่อน)
   หรือใช้ Manual Deploy โดย zip ไฟล์ทั้งหมดอัปโหลด
3. Build Command: npm install
4. Start Command: npm start
5. เพิ่ม Environment Variables ทุกตัวใน Render Dashboard:
   - LINE_CHANNEL_ACCESS_TOKEN
   - LINE_CHANNEL_SECRET
   - CLAUDE_API_KEY (ถ้ามี)
   - GOOGLE_SHEETS_URL
6. กด Deploy → รอสักครู่ → ได้ URL เช่น https://bullystop-bot.onrender.com

### ขั้นที่ 4 — ตั้งค่า Webhook ใน LINE

1. ไปที่ LINE Developers Console → Messaging API
2. Webhook URL: ใส่ URL จาก Render + /webhook
   ตัวอย่าง: https://bullystop-bot.onrender.com/webhook
3. กด Verify → ต้องขึ้น "Success"
4. เปิด "Use webhook" ให้เป็น On
5. ปิด "Auto-reply messages" และ "Greeting messages" (Bot จะจัดการเอง)

### ขั้นที่ 5 — ทดสอบ

1. เพิ่ม LINE OA เป็นเพื่อนโดยสแกน QR จาก LINE Manager
2. Bot จะส่งข้อความต้อนรับอัตโนมัติ
3. พิมพ์ "วิธีเล่น" หรือ "เริ่มเล่น" เพื่อทดสอบ

---

## คำสั่งที่ Bot รองรับ

| พิมพ์ | Bot ทำอะไร |
|-------|-----------|
| เริ่มเล่น | เริ่ม Pre-test แล้วเข้าสู่เกม |
| วิธีเล่น  | แสดงขั้นตอนการเล่น |
| การ์ด / สถานการณ์ | สุ่มการ์ดบูลลี่ใหม่ |
| คะแนน | แสดงคะแนนสะสม |
| ขอความช่วยเหลือ | แสดงเบอร์ติดต่อฉุกเฉิน |
| คำถามอิสระ | Claude AI ตอบ (ถ้ามี API Key) |

---

## การเพิ่มการ์ดบูลลี่ใหม่

เปิดไฟล์ game.js แล้วเพิ่มในอาร์เรย์ BULLY_CARDS:

```javascript
{
  id: 'B11',               // รหัสการ์ด (ต่อจาก B10)
  type: 'verbal',          // verbal / physical / social / cyber
  typeLabel: 'ทางวาจา',
  title: 'ชื่อการ์ด',
  desc: 'คำอธิบายสถานการณ์',
  choices: [
    { key: 'A', text: 'ตัวเลือก A', score: 0 },
    { key: 'B', text: 'ตัวเลือก B', score: 1 },
    { key: 'C', text: 'ตัวเลือก C (ถูก)', score: 3 },
    { key: 'D', text: 'ตัวเลือก D', score: 2 },
  ],
  explain: 'คำอธิบายเฉลยสำหรับผู้เล่น',
},
```

---

## ปัญหาที่พบบ่อย

**Bot ไม่ตอบ**
→ ตรวจสอบ Webhook URL ใน LINE Console → กด Verify ใหม่
→ เช็ค Render logs ว่ามี error อะไร

**Verify Webhook ไม่ผ่าน**
→ ตรวจสอบว่า Bot กำลัง running อยู่ (เปิด URL/health ในเบราว์เซอร์)
→ ตรวจสอบว่า LINE_CHANNEL_SECRET ถูกต้อง

**Google Sheets ไม่รับข้อมูล**
→ ตรวจสอบ GOOGLE_SHEETS_URL ใน Render Environment Variables
→ ตรวจสอบว่า Apps Script Deploy เป็น "Anyone" แล้ว

---

ติดต่อสอบถาม: ครูที่ปรึกษาโครงงาน BullyStop
