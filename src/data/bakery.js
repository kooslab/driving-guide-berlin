export const meta = { title: 'Bakery (Bäckerei)', emoji: '🥐', description: 'Ordering bread and pastries.', category: 'food' };
export const scenes = [{ id:'bakery-order', title:'Ordering at the counter', steps:[
  { speaker:'staff', de:'Guten Morgen! Was darf es sein?', en:'Good morning! What can I get you?' },
  { speaker:'you', de:'Ein Mischbrot, bitte.', en:'A mixed-grain loaf, please.',
    alts:[{de:'Zwei Brötchen, bitte.',en:'Two bread rolls, please.'},{de:'Ein Vollkornbrot, geschnitten, bitte.',en:'A wholegrain loaf, sliced, please.'}] },
  { speaker:'staff', de:'Darf es noch etwas sein?', en:'Anything else?' },
  { speaker:'you', de:'Und ein Croissant, bitte.', en:'And a croissant, please.',
    alts:[{de:'Nein danke, das ist alles.',en:'No thank you, that\'s all.'},{de:'Haben Sie auch Laugenstangen?',en:'Do you have pretzel sticks?'}] },
  { speaker:'staff', de:'Zusammen 3 Euro 20.', en:'That\'s 3 euros 20 together.' },
]}];
