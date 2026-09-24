export const meta = { title: 'Bank', emoji: '🏦', description: 'Opening an account and using ATMs.', category: 'errands' };
export const scenes = [
  { id:'konto-eroffnen', title:'Opening a bank account', steps:[
    { speaker:'you', de:'Ich würde gerne ein Girokonto eröffnen.', en:'I would like to open a current account.' },
    { speaker:'staff', de:'Sind Sie in Deutschland gemeldet?', en:'Are you registered in Germany?' },
    { speaker:'you', de:'Ja, hier ist meine Meldebestätigung.', en:'Yes, here is my registration confirmation.' },
    { speaker:'staff', de:'Und Ihren Personalausweis oder Reisepass, bitte.', en:'And your ID or passport, please.' },
    { speaker:'you', de:'Hier ist mein Reisepass.', en:'Here is my passport.' },
    { speaker:'staff', de:'Ich erkläre Ihnen die verschiedenen Kontomodelle.', en:'I will explain the different account models.' },
  ]},
  { id:'geldautomat', title:'At the ATM (Geldautomat)', steps:[
    { speaker:'you', de:'Entschuldigung, wo ist der nächste Geldautomat?', en:'Excuse me, where is the nearest ATM?' },
    { speaker:'staff', de:'Da drüben, neben dem Eingang.', en:'Over there, next to the entrance.' },
    { speaker:'you', de:'Kann ich hier mit ausländischer Karte abheben?', en:'Can I withdraw with a foreign card here?' },
    { speaker:'staff', de:'Ja, aber es können Gebühren anfallen.', en:'Yes, but there may be fees.' },
  ]},
];
