export const meta = { title: 'Airport (BER)', emoji: '✈️', description: 'Navigating Berlin Brandenburg Airport.', category: 'airport' };
export const scenes = [
  { id:'check-in', title:'At the check-in counter', steps:[
    { speaker:'staff', de:'Darf ich Ihren Reisepass und Ihre Buchungsbestätigung sehen?', en:'May I see your passport and booking confirmation?' },
    { speaker:'you', de:'Hier bitte.', en:'Here you go.' },
    { speaker:'staff', de:'Haben Sie Gepäck aufzugeben?', en:'Do you have any luggage to check in?' },
    { speaker:'you', de:'Ja, einen Koffer.', en:'Yes, one suitcase.', alts:[{de:'Nein, nur Handgepäck.',en:'No, only carry-on luggage.'}] },
    { speaker:'staff', de:'Bitte legen Sie den Koffer auf das Band.', en:'Please place the suitcase on the belt.' },
    { speaker:'staff', de:'Ihr Gate ist B14. Boarding beginnt um 14:30 Uhr.', en:'Your gate is B14. Boarding starts at 14:30.' },
  ]},
  { id:'sicherheitskontrolle', title:'Going through security', steps:[
    { speaker:'staff', de:'Bitte legen Sie alle Flüssigkeiten in den durchsichtigen Beutel.', en:'Please put all liquids in the transparent bag.' },
    { speaker:'staff', de:'Laptop und Tablets bitte separat in eine Wanne.', en:'Laptops and tablets please separately in a tray.' },
    { speaker:'you', de:'Muss ich auch die Schuhe ausziehen?', en:'Do I need to take my shoes off as well?' },
    { speaker:'staff', de:'Ja, bitte. Und den Gürtel auch.', en:'Yes, please. And the belt too.' },
    { speaker:'staff', de:'Bitte gehen Sie durch den Scanner.', en:'Please walk through the scanner.' },
  ]},
  { id:'gate', title:'At the boarding gate', steps:[
    { speaker:'staff', de:'Boarding für Flug EW 123 nach London, Gate B14.', en:'Boarding for flight EW 123 to London, Gate B14.' },
    { speaker:'you', de:'Ist das der Flug nach London Gatwick?', en:'Is this the flight to London Gatwick?' },
    { speaker:'staff', de:'Ja, genau. Ihre Bordkarte, bitte.', en:'Yes, exactly. Your boarding pass, please.' },
    { speaker:'you', de:'Ich habe eine digitale Bordkarte auf dem Handy.', en:'I have a digital boarding pass on my phone.' },
  ]},
  { id:'gepaeck-verloren', title:'Lost luggage', steps:[
    { speaker:'you', de:'Entschuldigung, mein Koffer ist nicht angekommen.', en:'Excuse me, my suitcase hasn\'t arrived.' },
    { speaker:'staff', de:'Tut mir leid. Haben Sie Ihre Gepäckquittung?', en:'I\'m sorry. Do you have your baggage receipt?' },
    { speaker:'you', de:'Ja, hier bitte.', en:'Yes, here you go.' },
    { speaker:'staff', de:'Können Sie den Koffer beschreiben? Farbe und Marke?', en:'Can you describe the suitcase? Colour and brand?' },
    { speaker:'you', de:'Schwarz, Samsonite, mit einem orangefarbenen Band.', en:'Black, Samsonite, with an orange strap.' },
    { speaker:'staff', de:'Bitte füllen Sie dieses Formular aus. Wir melden uns innerhalb von 24 Stunden.', en:'Please fill in this form. We will get back to you within 24 hours.' },
  ]},
];
