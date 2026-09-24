export const meta = { title: 'Pharmacy (Apotheke)', emoji: '💊', description: 'Getting medication with or without a prescription.', category: 'errands' };
export const scenes = [
  { id:'apotheke-rezept', title:'Collecting a prescription', steps:[
    { speaker:'you', de:'Ich habe ein Rezept von meinem Arzt.', en:'I have a prescription from my doctor.' },
    { speaker:'staff', de:'Darf ich das Rezept sehen?', en:'May I see the prescription?' },
    { speaker:'you', de:'Hier bitte.', en:'Here you go.' },
    { speaker:'staff', de:'Das Medikament ist vorrätig. Haben Sie eine Krankenkassenkarte?', en:'The medication is in stock. Do you have your health insurance card?' },
    { speaker:'you', de:'Ja, hier ist meine Karte.', en:'Yes, here is my card.' },
    { speaker:'staff', de:'Dann zahlen Sie nur die Zuzahlung: 5 Euro.', en:'Then you only pay the co-payment: 5 euros.' },
  ]},
  { id:'apotheke-freiverkauf', title:'Buying over-the-counter medication', steps:[
    { speaker:'you', de:'Ich brauche etwas gegen Kopfschmerzen.', en:'I need something for headaches.',
      alts:[{de:'Haben Sie etwas gegen Erkältung?',en:'Do you have something for a cold?'},{de:'Ich suche ein Mittel gegen Übelkeit.',en:'I\'m looking for something for nausea.'}] },
    { speaker:'staff', de:'Haben Sie eine Allergie gegen Ibuprofen oder Paracetamol?', en:'Do you have an allergy to ibuprofen or paracetamol?' },
    { speaker:'you', de:'Nein, keine Allergien.', en:'No, no allergies.' },
    { speaker:'staff', de:'Dann empfehle ich Ibuprofen 400. Das macht 4 Euro 95.', en:'Then I recommend Ibuprofen 400. That\'s 4 euros 95.' },
  ]},
];
