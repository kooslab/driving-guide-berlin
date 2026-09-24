export const meta = { title: 'Café', emoji: '☕', description: 'Ordering coffee and drinks.', category: 'food' };
export const scenes = [{ id:'cafe-order', title:'Ordering a coffee', steps:[
  { speaker:'staff', de:'Was kann ich für Sie tun?', en:'What can I do for you?',
    alts:[{de:'Was hätten Sie gerne?',en:'What would you like?'}] },
  { speaker:'you', de:'Einen Kaffee, bitte.', en:'A coffee, please.',
    alts:[{de:'Einen Cappuccino, bitte.',en:'A cappuccino, please.'},{de:'Einen Flat White, bitte.',en:'A flat white, please.'},{de:'Einen Tee mit Milch, bitte.',en:'A tea with milk, please.'}] },
  { speaker:'staff', de:'Groß oder klein?', en:'Large or small?', alts:[{de:'Mit Milch?',en:'With milk?'}] },
  { speaker:'you', de:'Groß, bitte. Zum Mitnehmen.', en:'Large, please. To take away.', alts:[{de:'Klein, für hier.',en:'Small, to drink here.'}] },
  { speaker:'staff', de:'Darf ich Ihren Namen für den Becher?', en:'May I have your name for the cup?' },
  { speaker:'you', de:'Alex.', en:'Alex.' },
]}];
