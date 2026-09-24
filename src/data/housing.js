export const meta = { title: 'Housing', emoji: '🏠', description: 'Dealing with your landlord and moving in.', category: 'housing' };
export const scenes = [
  { id:'vermieter-reparatur', title:'Reporting a repair to your landlord', steps:[
    { speaker:'you', de:'Guten Tag, hier spricht Mia aus der dritten Etage. Ich habe ein Problem mit der Heizung.', en:'Good day, this is Mia from the third floor. I have a problem with the heating.',
      alts:[{de:'Es gibt ein Wasserleck in meiner Wohnung.',en:'There is a water leak in my flat.'},{de:'Meine Spülmaschine ist kaputt.',en:'My dishwasher is broken.'}] },
    { speaker:'staff', de:'Seit wann haben Sie das Problem?', en:'Since when have you had this problem?' },
    { speaker:'you', de:'Seit gestern Abend. Die Wohnung wird nicht warm.', en:'Since yesterday evening. The flat is not getting warm.' },
    { speaker:'staff', de:'Ich schicke morgen früh einen Handwerker. Wann sind Sie zu Hause?', en:'I\'ll send a tradesperson tomorrow morning. When will you be at home?' },
    { speaker:'you', de:'Ich bin ab 9 Uhr zu Hause.', en:'I\'ll be home from 9 o\'clock.' },
  ]},
  { id:'einzug', title:'Moving in — collecting the keys', steps:[
    { speaker:'staff', de:'Willkommen! Hier sind Ihre Schlüssel — zwei für die Haustür, einer für die Wohnung.', en:'Welcome! Here are your keys — two for the front door, one for the flat.' },
    { speaker:'you', de:'Danke. Gibt es auch einen Briefkastenschlüssel?', en:'Thank you. Is there also a letterbox key?' },
    { speaker:'staff', de:'Ja, natürlich. Und bitte das Übergabeprotokoll unterschreiben.', en:'Yes, of course. And please sign the handover protocol.' },
    { speaker:'you', de:'Gibt es Besonderheiten bei der Mülltrennung?', en:'Are there any specifics about recycling?' },
    { speaker:'staff', de:'Ja, gelbe Tonne für Verpackungen, blaue für Papier, graue für Restmüll.', en:'Yes, yellow bin for packaging, blue for paper, grey for general waste.' },
  ]},
];
