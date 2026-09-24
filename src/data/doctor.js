export const meta = { title: 'Doctor (Arzt)', emoji: '🩺', description: 'Making an appointment and visiting the doctor.', category: 'health' };
export const scenes = [
  { id:'arzt-telefon', title:'Making an appointment by phone', steps:[
    { speaker:'staff', de:'Praxis Dr. Schneider, guten Morgen.', en:'Dr. Schneider\'s practice, good morning.' },
    { speaker:'you', de:'Guten Morgen. Ich würde gerne einen Termin vereinbaren.', en:'Good morning. I would like to make an appointment.',
      alts:[{de:'Ich bin neu hier und suche einen Hausarzt.',en:'I\'m new here and looking for a GP.'}] },
    { speaker:'staff', de:'Was ist Ihr Anliegen?', en:'What is your concern?' },
    { speaker:'you', de:'Ich habe seit drei Tagen Halsschmerzen.', en:'I have had a sore throat for three days.',
      alts:[{de:'Ich brauche eine Überweisung zum Facharzt.',en:'I need a referral to a specialist.'},{de:'Ich benötige eine Krankschreibung.',en:'I need a sick note.'}] },
    { speaker:'staff', de:'Können Sie am Dienstag um 10 Uhr?', en:'Can you come on Tuesday at 10 o\'clock?' },
    { speaker:'you', de:'Ja, das passt. Auf welchen Namen?', en:'Yes, that works. Under which name?' },
    { speaker:'staff', de:'Ihren Namen, bitte, und Versicherungskarte mitbringen.', en:'Your name, please, and bring your insurance card.' },
  ]},
  { id:'arzt-rezeption', title:'At the reception desk', steps:[
    { speaker:'staff', de:'Guten Tag. Haben Sie einen Termin?', en:'Good day. Do you have an appointment?' },
    { speaker:'you', de:'Ja, um 10 Uhr, auf den Namen Kim.', en:'Yes, at 10 o\'clock, under the name Kim.' },
    { speaker:'staff', de:'Ihre Versicherungskarte, bitte.', en:'Your insurance card, please.' },
    { speaker:'you', de:'Hier bitte. Ich bin neu — ich habe eine EHIC-Karte.', en:'Here you go. I\'m new — I have an EHIC card.',
      alts:[{de:'Ich habe eine gesetzliche Versicherung.',en:'I have statutory health insurance.'},{de:'Ich bin privat versichert.',en:'I have private health insurance.'}] },
    { speaker:'staff', de:'Bitte füllen Sie diesen Fragebogen aus und nehmen Sie Platz.', en:'Please fill in this questionnaire and have a seat.' },
  ]},
];
