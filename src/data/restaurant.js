export const meta = { title: 'Restaurant', emoji: '🍽️', description: 'Entering, ordering, and asking for the bill.', category: 'food' };
export const scenes = [
  { id:'restaurant-table', title:'Getting a table', steps:[
    { speaker:'staff', de:'Guten Abend! Haben Sie reserviert?', en:'Good evening! Do you have a reservation?',
      alts:[{de:'Guten Tag! Für wie viele Personen?',en:'Good afternoon! For how many people?'}] },
    { speaker:'you', de:'Nein, aber haben Sie noch einen Tisch für zwei?', en:'No, do you have a table for two?',
      alts:[{de:'Ja, auf den Namen Müller.',en:'Yes, under the name Müller.'}] },
    { speaker:'staff', de:'Ja, bitte folgen Sie mir.', en:'Yes, please follow me.',
      alts:[{de:'Es tut mir leid, wir sind voll besetzt.',en:'I\'m sorry, we are fully booked.'}] },
  ]},
  { id:'restaurant-order', title:'Ordering food and drinks', steps:[
    { speaker:'staff', de:'Was darf ich Ihnen bringen?', en:'What can I bring you?',
      alts:[{de:'Haben Sie schon gewählt?',en:'Have you chosen yet?'}] },
    { speaker:'you', de:'Ich nehme das Schnitzel, bitte.', en:'I\'ll have the Schnitzel, please.',
      alts:[{de:'Was empfehlen Sie?',en:'What do you recommend?'},{de:'Ich hätte gerne den Salat als Vorspeise.',en:'I would like the salad as a starter.'}] },
    { speaker:'staff', de:'Und was möchten Sie trinken?', en:'And what would you like to drink?' },
    { speaker:'you', de:'Ein Wasser, bitte.', en:'A water, please.',
      alts:[{de:'Ein Bier, bitte.',en:'A beer, please.'},{de:'Ein Glas Wein, bitte.',en:'A glass of wine, please.'}] },
    { speaker:'staff', de:'Still oder mit Kohlensäure?', en:'Still or sparkling?' },
    { speaker:'you', de:'Still, bitte.', en:'Still, please.' },
  ]},
  { id:'restaurant-bill', title:'Asking for the bill', steps:[
    { speaker:'you', de:'Entschuldigung, die Rechnung, bitte.', en:'Excuse me, the bill, please.',
      alts:[{de:'Wir würden gerne zahlen.',en:'We would like to pay.'},{de:'Könnten wir bitte zahlen?',en:'Could we pay, please?'}] },
    { speaker:'staff', de:'Zusammen oder getrennt?', en:'Together or separately?' },
    { speaker:'you', de:'Zusammen, bitte.', en:'Together, please.',
      alts:[{de:'Getrennt, bitte.',en:'Separately, please.'}] },
    { speaker:'staff', de:'Das macht 38 Euro 50.', en:'That\'s 38 euros 50.' },
    { speaker:'you', de:'Stimmt so.', en:'Keep the change.',
      alts:[{de:'Kann ich mit Karte zahlen?',en:'Can I pay by card?'}] },
  ]},
];
