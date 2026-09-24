export const meta = { title: 'Post office (Postamt)', emoji: '📮', description: 'Sending and picking up packages.', category: 'errands' };
export const scenes = [
  { id:'paket-senden', title:'Sending a package', steps:[
    { speaker:'staff', de:'Guten Tag! Was kann ich für Sie tun?', en:'Good day! What can I do for you?' },
    { speaker:'you', de:'Ich möchte dieses Paket nach England schicken.', en:'I would like to send this package to England.',
      alts:[{de:'Ich möchte einen Brief nach Frankreich schicken.',en:'I would like to send a letter to France.'}] },
    { speaker:'staff', de:'Haben Sie es schon verpackt und beschriftet?', en:'Have you already packed and labelled it?' },
    { speaker:'you', de:'Ja, hier ist die Adresse.', en:'Yes, here is the address.' },
    { speaker:'staff', de:'Möchten Sie Einschreiben oder normal?', en:'Registered post or normal?',
      alts:[{de:'Wie schnell soll es ankommen?',en:'How quickly should it arrive?'}] },
    { speaker:'you', de:'Normal ist gut. Was kostet das?', en:'Normal is fine. How much does that cost?' },
    { speaker:'staff', de:'Sechs Euro 80 für Päckchen S nach Großbritannien.', en:'Six euros 80 for a small parcel to Great Britain.' },
  ]},
  { id:'paket-abholen', title:'Picking up a package', steps:[
    { speaker:'you', de:'Ich habe eine Benachrichtigung bekommen. Ich möchte ein Paket abholen.', en:'I received a notification. I would like to pick up a package.' },
    { speaker:'staff', de:'Haben Sie die Benachrichtigungskarte und einen Ausweis?', en:'Do you have the notification card and an ID?' },
    { speaker:'you', de:'Ja, hier bitte.', en:'Yes, here you go.' },
    { speaker:'staff', de:'Einen Moment, ich hole das Paket.', en:'One moment, I\'ll get the package.' },
    { speaker:'staff', de:'Bitte unterschreiben Sie hier.', en:'Please sign here.' },
  ]},
];
