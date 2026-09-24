export const meta = { title: 'Supermarket', emoji: '🛒', description: 'Finding items and checking out.', category: 'food' };
export const scenes = [
  { id:'supermarket-find', title:'Finding something in the store', steps:[
    { speaker:'you', de:'Entschuldigung, wo finde ich die Milch?', en:'Excuse me, where can I find the milk?',
      alts:[{de:'Entschuldigung, haben Sie Hafermilch?',en:'Excuse me, do you have oat milk?'}] },
    { speaker:'staff', de:'Die Milch ist hinten links, neben den Käseprodukten.', en:'The milk is in the back left, next to the cheese.',
      alts:[{de:'Gang drei, auf der rechten Seite.',en:'Aisle three, on the right side.'}] },
    { speaker:'you', de:'Vielen Dank!', en:'Thank you very much!' },
  ]},
  { id:'supermarket-checkout', title:'At the checkout', steps:[
    { speaker:'staff', de:'Haben Sie eine Payback-Karte?', en:'Do you have a Payback card?' },
    { speaker:'you', de:'Nein, danke.', en:'No, thank you.', alts:[{de:'Ja, bitte.',en:'Yes, please.'}] },
    { speaker:'staff', de:'Möchten Sie eine Tüte?', en:'Would you like a bag?' },
    { speaker:'you', de:'Nein danke, ich habe meinen eigenen Beutel.', en:'No thanks, I have my own bag.',
      alts:[{de:'Ja, eine bitte.',en:'Yes, one please.'}] },
    { speaker:'staff', de:'Das macht 12 Euro 80.', en:'That\'s 12 euros 80.' },
    { speaker:'you', de:'Mit Karte, bitte.', en:'By card, please.',
      alts:[{de:'Hier ist ein Zwanzig-Euro-Schein.',en:'Here is a twenty-euro note.'}] },
  ]},
];
