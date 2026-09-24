export const meta = { title: 'Admin & Registration', emoji: '📋', description: 'Making appointments, Bürgeramt, and forms.', category: 'admin' };
export const scenes = [
  { id:'termin-machen', title:'Making an appointment (Termin)', steps:[
    { speaker:'you', de:'Ich würde gerne einen Termin beim Bürgeramt machen.', en:'I would like to make an appointment at the residents\' office.',
      alts:[{de:'Ich brauche einen Termin zur Ummeldung.',en:'I need an appointment to re-register my address.'}] },
    { speaker:'staff', de:'Termine buchen Sie online unter service.berlin.de.', en:'Appointments are booked online at service.berlin.de.' },
    { speaker:'you', de:'Gibt es auch Termine ohne Voranmeldung?', en:'Are there also walk-in appointments?' },
    { speaker:'staff', de:'Manchmal, aber meistens nur für dringende Fälle. Online ist sicherer.', en:'Sometimes, but mostly only for urgent cases. Online is safer.' },
  ]},
  { id:'buergeramt', title:'At the Bürgeramt', steps:[
    { speaker:'staff', de:'Ticket Nummer B42, Schalter 3 bitte.', en:'Ticket number B42, counter 3 please.' },
    { speaker:'you', de:'Guten Tag. Ich möchte mich anmelden. Hier sind meine Unterlagen.', en:'Good day. I would like to register my address. Here are my documents.',
      alts:[{de:'Ich möchte meinen Personalausweis verlängern.',en:'I would like to renew my ID card.'}] },
    { speaker:'staff', de:'Haben Sie die Wohnungsgeberbestätigung vom Vermieter?', en:'Do you have the landlord\'s address confirmation form?' },
    { speaker:'you', de:'Ja, hier ist das Formular.', en:'Yes, here is the form.' },
    { speaker:'staff', de:'Gut. Bitte unterschreiben Sie hier. Die Bestätigung kommt per Post.', en:'Good. Please sign here. The confirmation will come by post.' },
  ]},
  { id:'formular-ausfuellen', title:'Filling in a form', steps:[
    { speaker:'you', de:'Entschuldigung, was bedeutet dieses Feld?', en:'Excuse me, what does this field mean?' },
    { speaker:'staff', de:'Das ist das Geburtsdatum. Tag, Monat, Jahr.', en:'That is the date of birth. Day, month, year.' },
    { speaker:'you', de:'Und hier — was bedeutet "Staatsangehörigkeit"?', en:'And here — what does "Staatsangehörigkeit" mean?' },
    { speaker:'staff', de:'Das ist Ihre Nationalität. Zum Beispiel "Britisch".', en:'That is your nationality. For example "British".' },
  ]},
];
