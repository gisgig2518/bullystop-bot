// handlers.js — ข้อความภาษาเป็นกันเอง เหมือนเพื่อน

const game   = require('./game');
const sheets = require('./sheets');
const flex   = require('./flex');
const ai     = require('./ai');

const userState = {};

async function handleEvent(event, client) {
  const userId = event.source.userId;
  if (event.type === 'follow') {
    userState[userId] = { phase: 'welcome', score: 0, pretest: null };
    await sheets.logAction(userId, 'follow', '-');
    return client.replyMessage(event.replyToken, msgWelcome());
  }
  if (event.type === 'message' && event.message.type === 'text') {
    const text  = event.message.text.trim();
    const state = userState[userId] || { phase: 'welcome', score: 0 };
    userState[userId] = state;
    return routeText(text, state, userId, event.replyToken, client);
  }
  if (event.type === 'postback') {
    const data   = new URLSearchParams(event.postback.data);
    const state  = userState[userId] || { phase: 'game', score: 0 };
    userState[userId] = state;
    return handlePostback(data.get('action'), data.get('value'), data.get('card'), state, userId, event.replyToken, client);
  }
}

async function routeText(text, state, userId, replyToken, client) {
  const t = text.toLowerCase();
  if (t.includes('เริ่มเล่น') || t === 'เริ่ม' || t === 'start') {
    userState[userId].phase = 'pretest';
    return client.replyMessage(replyToken, flex.pretestIntro());
  }
  if (t.includes('วิธีเล่น') || t.includes('help')) {
    return client.replyMessage(replyToken, msgHowToPlay());
  }
  if (t.includes('การ์ด') || t.includes('สถานการณ์') || t.includes('บูลลี่')) {
    return client.replyMessage(replyToken, flex.bullyCard(game.getRandomCard()));
  }
  if (t.includes('คะแนน') || t.includes('ผล')) {
    return client.replyMessage(replyToken, msgScore(state.score || 0));
  }
  if (t.includes('ขอความช่วยเหลือ') || t.includes('ช่วยด้วย') || t.includes('ถูกบูลลี่')) {
    await sheets.logAction(userId, 'help_request', text);
    return client.replyMessage(replyToken, msgHelp());
  }
  const aiReply = await ai.ask(text, state);
  await sheets.logAction(userId, 'ai_chat', text);
  return client.replyMessage(replyToken, { type: 'text', text: aiReply });
}

async function handlePostback(action, value, cardId, state, userId, replyToken, client) {
  if (action === 'answer') {
    const result = game.checkAnswer(cardId, value);
    userState[userId].score = (state.score || 0) + result.score;
    await sheets.logAnswer(userId, cardId, value, result.score);
    return client.replyMessage(replyToken, [flex.answerResult(result), flex.nextCardPrompt(userState[userId].score)]);
  }
  if (action === 'next_card') {
    return client.replyMessage(replyToken, flex.bullyCard(game.getRandomCard()));
  }
  if (action === 'pretest_answer') {
    if (!userState[userId].pretestAnswers) userState[userId].pretestAnswers = [];
    userState[userId].pretestAnswers.push({ q: cardId, a: value });
    const total = userState[userId].pretestAnswers.length;
    if (total < 10) return client.replyMessage(replyToken, flex.pretestQuestion(game.getPretestQuestion(total), total + 1));
    const score = game.scorePre(userState[userId].pretestAnswers);
    userState[userId].pretest = score;
    await sheets.logPretest(userId, score);
    return client.replyMessage(replyToken, flex.pretestResult(score));
  }
  if (action === 'start_game') {
    return client.replyMessage(replyToken, [
      { type: 'text', text: 'ไปเลย! 🎮 หยุดช่องสีส้มบนกระดานแล้วกด "รับสถานการณ์" ได้เลยนะครับ' },
      flex.bullyCard(game.getRandomCard()),
    ]);
  }
  if (action === 'posttest') {
    userState[userId].posttestAnswers = [];
    return client.replyMessage(replyToken, [
      { type: 'text', text: 'เย่! เล่นครบแล้ว 🎉 มาทำ Post-test กันเถอะ มี 10 ข้อเหมือนเดิมเลยครับ' },
      flex.pretestQuestion(game.getPretestQuestion(0), 1, true),
    ]);
  }
  if (action === 'posttest_answer') {
    if (!userState[userId].posttestAnswers) userState[userId].posttestAnswers = [];
    userState[userId].posttestAnswers.push({ q: cardId, a: value });
    const total = userState[userId].posttestAnswers.length;
    if (total < 10) return client.replyMessage(replyToken, flex.pretestQuestion(game.getPretestQuestion(total), total + 1, true));
    const post = game.scorePre(userState[userId].posttestAnswers);
    const pre  = userState[userId].pretest || 0;
    await sheets.logPosttest(userId, post);
    return client.replyMessage(replyToken, flex.finalReport(pre, post, userState[userId].score || 0));
  }
}

// ══ ข้อความทั้งหมด ══

function msgWelcome() {
  return {
    type: 'flex', altText: 'ยินดีต้อนรับสู่ BullyStop Bot!',
    contents: {
      type: 'bubble',
      header: { type:'box', layout:'vertical', backgroundColor:'#06C755', paddingAll:'18px', contents:[
        { type:'text', text:'BullyStop Bot 🎮', color:'#ffffff', size:'xl', weight:'bold' },
        { type:'text', text:'นวัตกรรมเกม AI ต้านการบูลลี่ผ่าน LINE', color:'#ccffdd', size:'xs' },
      ]},
      body: { type:'box', layout:'vertical', spacing:'md', paddingAll:'16px', contents:[
        { type:'text', text:'สวัสดีครับ! 👋 ยินดีต้อนรับ', weight:'bold', size:'lg' },
        { type:'text', text:'ฉันคือผู้ช่วยของบอร์ดเกม STAND UP! ที่จะช่วยให้เราเรียนรู้วิธีรับมือกับการบูลลี่ด้วยกันนะครับ 😊', wrap:true, color:'#555555', size:'sm' },
      ]},
      footer: { type:'box', layout:'vertical', spacing:'sm', paddingAll:'16px', contents:[
        { type:'button', action:{ type:'message', label:'🎮 เริ่มเล่น', message:'เริ่มเล่น' }, style:'primary', color:'#06C755' },
        { type:'button', action:{ type:'message', label:'📖 วิธีเล่น', message:'วิธีเล่น' }, style:'secondary' },
      ]},
    },
  };
}

function msgHowToPlay() {
  return { type:'text', text:
    'วิธีเล่นบอร์ดเกม STAND UP! 🎲\n\n' +
    '1️⃣ สแกน QR กลางกระดาน เพิ่ม Bot เป็นเพื่อน\n' +
    '2️⃣ ทอดลูกเต๋าแล้วเดินตัวหมาก\n' +
    '3️⃣ หยุดช่องสีส้ม = ได้รับสถานการณ์บูลลี่จากฉัน\n' +
    '4️⃣ เลือกตอบ A B C หรือ D ภายใน 60 วินาที\n' +
    '5️⃣ รับคะแนนและคำอธิบายทันที\n' +
    '6️⃣ เล่นครบรอบแล้วทำ Post-test\n\n' +
    'สู้ๆ นะครับ! 💪'
  };
}

function msgScore(score) {
  return { type:'text', text:
    `คะแนนทักษะสะสมของเธอตอนนี้คือ ${score} คะแนน นะครับ 🌟\n\n` +
    'พิมพ์ "การ์ด" เพื่อรับสถานการณ์ใหม่\n' +
    'หรือพิมพ์ "ทำ Post-test" เมื่อเล่นครบแล้วครับ 😊'
  };
}

function msgHelp() {
  return { type:'text', text:
    'ฉันอยู่ตรงนี้นะครับ 💙\n\n' +
    'ถ้าเธอกำลังเผชิญกับการบูลลี่อยู่จริงๆ\n' +
    'อย่าแบกรับไว้คนเดียวนะครับ มีคนพร้อมช่วยเสมอ\n\n' +
    '📞 ติดต่อได้เลย:\n' +
    '• ครูแนะแนวของโรงเรียน\n' +
    '• ผู้ปกครองหรือคนในครอบครัว\n' +
    '• สายด่วนเด็กและเยาวชน โทร 1387\n\n' +
    'เธอไม่ได้อยู่คนเดียวนะครับ 🤝'
  };
}

module.exports = { handleEvent };
