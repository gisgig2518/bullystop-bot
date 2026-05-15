// flex.js — Flex Messages ทุกรูปแบบ ภาษาเป็นกันเอง

const TYPE_COLOR = {
  verbal:   { bg:'#FAECE7', head:'#993C1D', badge:'#f0997b' },
  physical: { bg:'#FCEBEB', head:'#A32D2D', badge:'#f09595' },
  social:   { bg:'#FBEAF0', head:'#993556', badge:'#ed93b1' },
  cyber:    { bg:'#E6F1FB', head:'#185FA5', badge:'#85b7eb' },
};

function bullyCard(card) {
  const c = TYPE_COLOR[card.type] || TYPE_COLOR.verbal;
  return {
    type: 'flex', altText: `การ์ด ${card.title} — เลือกวิธีรับมือ`,
    contents: {
      type: 'bubble', size: 'mega',
      header: { type:'box', layout:'horizontal', backgroundColor:c.bg, paddingAll:'14px', contents:[
        { type:'box', layout:'vertical', flex:1, contents:[
          { type:'text', text:`การ์ด ${card.id}`, size:'xxs', color:c.head, weight:'bold' },
          { type:'text', text:card.title, size:'lg', weight:'bold', color:c.head, wrap:true },
        ]},
        { type:'box', layout:'vertical', backgroundColor:c.badge, cornerRadius:'20px', paddingAll:'6px', paddingStart:'12px', paddingEnd:'12px', justifyContent:'center',
          contents:[{ type:'text', text:card.typeLabel, size:'xxs', color:'#ffffff', weight:'bold' }] },
      ]},
      body: { type:'box', layout:'vertical', spacing:'md', paddingAll:'16px', contents:[
        { type:'text', text:'สถานการณ์นี้เกิดขึ้น...', size:'xs', color:'#888888', weight:'bold' },
        { type:'text', text:card.desc, wrap:true, size:'sm', color:'#333333', lineSpacing:'4px' },
        { type:'separator', margin:'md' },
        { type:'text', text:'เธอจะทำอะไร? 🤔', size:'xs', color:'#888888', weight:'bold', margin:'md' },
        ...card.choices.map(ch => ({
          type:'button',
          action:{ type:'postback', label:`${ch.key}. ${ch.text.substring(0,28)}`, data:`action=answer&card=${card.id}&value=${ch.key}` },
          style:'secondary', height:'sm', margin:'xs',
        })),
      ]},
      footer:{ type:'box', layout:'horizontal', contents:[
        { type:'text', text:'BullyStop Bot — STAND UP! 🎮', size:'xxs', color:'#aaaaaa', flex:1 },
      ]},
    },
  };
}

function answerResult(result) {
  const score    = result.score;
  const starText = '★'.repeat(score) + '☆'.repeat(3 - score);
  const isGood   = score >= 2;
  const bgColor  = isGood ? '#E1F5EE' : score === 0 ? '#FCEBEB' : '#FAEEDA';
  const titles   = {
    3: 'เยี่ยมมากเลย! ตอบถูกต้องครับ 🎉',
    2: 'ดีนะครับ แต่ยังมีวิธีที่ดีกว่านี้อีก',
    1: 'เกือบแล้วครับ ลองดูเฉลยด้วยกันนะ 😊',
    0: 'ยังไม่ถูกนะครับ ไม่เป็นไรเลย เรียนรู้ด้วยกัน 💙',
  };
  const titleCol = { 3:'#085041', 2:'#633806', 1:'#633806', 0:'#993C1D' };
  return {
    type:'flex', altText:`ผลการตอบ: ${score} คะแนน`,
    contents:{
      type:'bubble',
      body:{ type:'box', layout:'vertical', spacing:'md', backgroundColor:bgColor, paddingAll:'18px', contents:[
        { type:'text', text:starText, align:'center', size:'xl', color:'#f5a623' },
        { type:'text', text:titles[score] || titles[0], align:'center', weight:'bold', size:'lg', color:titleCol[score] || titleCol[0] },
        { type:'separator' },
        { type:'text', text:'เฉลยที่ดีที่สุด:', size:'xs', color:'#888888', weight:'bold', margin:'md' },
        { type:'box', layout:'vertical', backgroundColor:'#E1F5EE', cornerRadius:'8px', paddingAll:'10px', margin:'sm',
          contents:[{ type:'text', text:`${result.bestChoice.key}. ${result.bestChoice.text}`, size:'sm', color:'#085041', weight:'bold', wrap:true }] },
        { type:'text', text:'เหตุผล:', size:'xs', color:'#888888', weight:'bold', margin:'md' },
        { type:'text', text:result.explain, wrap:true, size:'sm', color:'#444444', lineSpacing:'4px' },
      ]},
    },
  };
}

function nextCardPrompt(totalScore) {
  return {
    type:'flex', altText:'เล่นต่อหรือ Post-test?',
    contents:{
      type:'bubble',
      body:{ type:'box', layout:'vertical', spacing:'sm', contents:[
        { type:'text', text:`คะแนนสะสมของเธอ: ${totalScore} คะแนน 🌟`, size:'sm', color:'#666666', align:'center' },
        { type:'text', text:'อยากทำอะไรต่อดีครับ?', weight:'bold', align:'center' },
      ]},
      footer:{ type:'box', layout:'vertical', spacing:'sm', contents:[
        { type:'button', action:{ type:'postback', label:'🃏 การ์ดถัดไป', data:'action=next_card' }, style:'primary', color:'#06C755' },
        { type:'button', action:{ type:'postback', label:'📝 ทำ Post-test', data:'action=posttest' }, style:'secondary' },
      ]},
    },
  };
}

function pretestIntro() {
  return {
    type:'flex', altText:'แบบทดสอบก่อนเรียน Pre-test',
    contents:{
      type:'bubble',
      header:{ type:'box', layout:'vertical', backgroundColor:'#7c4dff', paddingAll:'16px', contents:[
        { type:'text', text:'แบบทดสอบก่อนเรียน 📝', color:'#ffffff', weight:'bold', size:'lg' },
        { type:'text', text:'Pre-test | 10 ข้อ | ~5-8 นาที', color:'#ccbbff', size:'xs' },
      ]},
      body:{ type:'box', layout:'vertical', spacing:'sm', paddingAll:'16px', contents:[
        { type:'text', text:'ก่อนเริ่มเกม เราทำแบบทดสอบสั้นๆ กันก่อนนะครับ', wrap:true, size:'sm', color:'#555555' },
        { type:'text', text:'ไม่มีถูก-ผิด ตอบตามความรู้สึกตัวเองได้เลยครับ 😊', wrap:true, size:'sm', color:'#555555' },
        { type:'text', text:'ผลจะถูกบันทึกเพื่อวัดพัฒนาการหลังเล่นเกมครับ', wrap:true, size:'xs', color:'#888888' },
      ]},
      footer:{ type:'box', layout:'vertical', contents:[
        { type:'button', action:{ type:'postback', label:'📝 เริ่มทำแบบทดสอบ', data:'action=pretest_answer&card=T01&value=START' }, style:'primary', color:'#7c4dff' },
      ]},
    },
  };
}

function pretestQuestion(q, num, isPost = false) {
  const prefix = isPost ? 'posttest_answer' : 'pretest_answer';
  const color  = isPost ? '#06C755' : '#7c4dff';
  const label  = isPost ? `Post-test ข้อ ${num}/10` : `Pre-test ข้อ ${num}/10`;
  return {
    type:'flex', altText:`${label}: ${q.text}`,
    contents:{
      type:'bubble',
      header:{ type:'box', layout:'vertical', backgroundColor:color, paddingAll:'12px', contents:[
        { type:'text', text:label, color:'#ffffff', size:'xs', weight:'bold' },
      ]},
      body:{ type:'box', layout:'vertical', spacing:'md', paddingAll:'16px', contents:[
        { type:'text', text:q.text, wrap:true, weight:'bold', size:'md' },
        { type:'separator' },
        ...q.choices.map(c => ({
          type:'button',
          action:{ type:'postback', label:`${c.key}. ${c.text.substring(0,30)}`, data:`action=${prefix}&card=${q.id}&value=${c.key}` },
          style:'secondary', height:'sm', margin:'xs',
        })),
      ]},
    },
  };
}

function pretestResult(score) {
  const max  = 10;
  const pct  = Math.round((score / max) * 100);
  let level  = 'ต้องพัฒนาต่อนะครับ';
  let color  = '#E24B4A';
  if (pct >= 80) { level = 'เก่งมากเลยครับ!'; color = '#1D9E75'; }
  else if (pct >= 60) { level = 'ดีนะครับ ยังพัฒนาได้อีก'; color = '#BA7517'; }
  return {
    type:'flex', altText:`ผล Pre-test: ${score}/${max} คะแนน`,
    contents:{
      type:'bubble',
      body:{ type:'box', layout:'vertical', spacing:'md', paddingAll:'20px', contents:[
        { type:'text', text:'ทำแบบทดสอบเสร็จแล้ว ขอบคุณมากนะครับ! 🙌', weight:'bold', size:'md', wrap:true, align:'center' },
        { type:'text', text:`${score} / ${max}`, size:'xxl', weight:'bold', align:'center', color },
        { type:'text', text:level, align:'center', size:'sm', color:'#666666' },
        { type:'separator', margin:'lg' },
        { type:'text', text:'ตอนนี้ไปเล่นบอร์ดเกม STAND UP! กันได้เลยครับ เมื่อเล่นครบแล้วค่อยกลับมาทำ Post-test เพื่อดูว่าทักษะเราพัฒนาขึ้นแค่ไหนนะ 📈', wrap:true, size:'sm', color:'#666666' },
      ]},
      footer:{ type:'box', layout:'vertical', contents:[
        { type:'button', action:{ type:'postback', label:'🎮 เริ่มเล่นเกม!', data:'action=start_game' }, style:'primary', color:'#06C755' },
      ]},
    },
  };
}

function finalReport(pre, post, gameScore) {
  const max    = 10;
  const diff   = post - pre;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const color  = diff >= 0 ? '#1D9E75' : '#E24B4A';
  const msg    = diff >= 3
    ? 'ยอดเยี่ยมมากเลยนะครับ! ทักษะชีวิตพัฒนาขึ้นมากเลย 🏆'
    : diff >= 0
    ? 'ดีนะครับ มีพัฒนาการในทางที่ดีขึ้นแล้ว 😊'
    : 'ไม่เป็นไรนะครับ ลองเล่นอีกรอบเพื่อพัฒนาทักษะต่อได้เลยครับ 💙';
  return {
    type:'flex', altText:'รายงานผลการเรียนรู้ BullyStop',
    contents:{
      type:'bubble', size:'mega',
      header:{ type:'box', layout:'vertical', backgroundColor:'#06C755', paddingAll:'18px', contents:[
        { type:'text', text:'รายงานผลการเรียนรู้ 📊', color:'#ffffff', weight:'bold', size:'xl' },
        { type:'text', text:'BullyStop — STAND UP! Board Game', color:'#ccffdd', size:'xs' },
      ]},
      body:{ type:'box', layout:'vertical', spacing:'md', paddingAll:'18px', contents:[
        { type:'box', layout:'horizontal', contents:[
          scoreBox('Pre-test', `${pre}/${max}`, '#7c4dff'),
          { type:'box', layout:'vertical', flex:0, contents:[{ type:'text', text:'→', size:'xl', color:'#aaaaaa', offsetTop:'10px' }] },
          scoreBox('Post-test', `${post}/${max}`, '#06C755'),
          scoreBox('พัฒนาการ', diffStr, color),
        ]},
        { type:'separator', margin:'lg' },
        { type:'text', text:`คะแนนทักษะจากเกม: ${gameScore} คะแนน 🎮`, size:'sm', color:'#555555', margin:'md' },
        { type:'box', layout:'vertical', backgroundColor:'#E1F5EE', cornerRadius:'8px', paddingAll:'12px', margin:'md',
          contents:[{ type:'text', text:msg, wrap:true, size:'sm', color:'#085041', weight:'bold' }] },
        { type:'text', text:'ผลนี้ถูกส่งให้คุณครูแล้วนะครับ ขอบคุณที่ร่วมเล่นด้วยกัน! 💙', size:'xs', color:'#aaaaaa', align:'center', margin:'lg', wrap:true },
      ]},
    },
  };
}

function scoreBox(label, value, color) {
  return { type:'box', layout:'vertical', flex:1, alignItems:'center', contents:[
    { type:'text', text:value, align:'center', weight:'bold', size:'xl', color },
    { type:'text', text:label, align:'center', size:'xxs', color:'#888888' },
  ]};
}

function howToPlay() {
  return {
    type:'flex', altText:'วิธีเล่นบอร์ดเกม BullyStop',
    contents:{
      type:'bubble',
      header:{ type:'box', layout:'vertical', backgroundColor:'#EEEDFE', paddingAll:'14px', contents:[
        { type:'text', text:'วิธีเล่น STAND UP! 🎮', weight:'bold', size:'lg', color:'#3C3489' },
        { type:'text', text:'บอร์ดเกมต้านการบูลลี่', size:'xs', color:'#534AB7' },
      ]},
      body:{ type:'box', layout:'vertical', spacing:'sm', paddingAll:'16px', contents:[
        stepRow('1', 'สแกน QR บนกระดานเพื่อเชื่อมต่อ Bot'),
        stepRow('2', 'ทอดลูกเต๋าและเดินตัวหมาก'),
        stepRow('3', 'หยุดช่องสีส้ม → Bot ส่งสถานการณ์มาให้'),
        stepRow('4', 'กดเลือกตัวเลือก A–D ภายใน 60 วินาที'),
        stepRow('5', 'รับคะแนนและคำอธิบายจาก AI'),
        stepRow('6', 'เล่นครบ 40 ช่อง → ทำ Post-test'),
      ]},
      footer:{ type:'box', layout:'vertical', contents:[
        { type:'button', action:{ type:'message', label:'🎮 เริ่มเล่นได้เลย!', message:'เริ่มเล่น' }, style:'primary', color:'#06C755' },
      ]},
    },
  };
}

function stepRow(num, text) {
  return { type:'box', layout:'horizontal', spacing:'md', margin:'sm', contents:[
    { type:'box', layout:'vertical', backgroundColor:'#7c4dff', width:'22px', height:'22px', cornerRadius:'11px', justifyContent:'center', alignItems:'center', flex:0,
      contents:[{ type:'text', text:num, size:'xxs', color:'#ffffff', weight:'bold', align:'center' }] },
    { type:'text', text, wrap:true, size:'sm', color:'#444444', flex:1 },
  ]};
}

function scoreCard(score) {
  return { type:'text', text:`คะแนนทักษะสะสมของเธอตอนนี้คือ ${score} คะแนน นะครับ 🌟\n\nพิมพ์ "การ์ด" เพื่อรับสถานการณ์ใหม่\nหรือพิมพ์ "ทำ Post-test" เมื่อเล่นครบแล้วครับ 😊` };
}

function helpMessage() {
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

module.exports = { bullyCard, answerResult, nextCardPrompt, pretestIntro, pretestQuestion, pretestResult, finalReport, howToPlay, scoreCard, helpMessage };
