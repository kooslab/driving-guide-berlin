export const meta = { title: 'Transport', emoji: '🚇', description: 'U-Bahn tickets, Uber/Bolt, taxis, and buses.', category: 'transport' };
export const scenes = [
  { id:'ubahn-ticket', title:'Buying a U-Bahn / S-Bahn ticket', steps:[
    { speaker:'you', de:'Entschuldigung, wie kaufe ich eine Fahrkarte?', en:'Excuse me, how do I buy a ticket?' },
    { speaker:'staff', de:'Am Automaten. Drücken Sie auf "Einzelfahrschein", dann Zone AB.', en:'At the machine. Press "Single ticket", then select zone AB.',
      alts:[{de:'Sie können auch die BVG-App nutzen.',en:'You can also use the BVG app.'}] },
    { speaker:'you', de:'Was kostet eine Einzelfahrt?', en:'How much is a single journey?' },
    { speaker:'staff', de:'Drei Euro 50 für Zone AB.', en:'Three euros 50 for zone AB.' },
    { speaker:'you', de:'Muss ich den Fahrschein entwerten?', en:'Do I need to validate the ticket?' },
    { speaker:'staff', de:'Ja, stecken Sie ihn in den gelben Entwerter am Eingang.', en:'Yes, insert it into the yellow validator at the entrance.' },
  ]},
  { id:'uber-bolt', title:'Taking an Uber or Bolt', steps:[
    { speaker:'you', de:'Sind Sie Max für die Fahrt nach Mitte?', en:'Are you Max for the ride to Mitte?',
      alts:[{de:'Ich habe eine Fahrt gebucht auf den Namen Schmidt.',en:'I have a ride booked under the name Schmidt.'}] },
    { speaker:'staff', de:'Ja, genau. Steigen Sie ein, bitte.', en:'Yes, exactly. Please get in.' },
    { speaker:'you', de:'Könnten Sie bitte die Klimaanlage etwas leiser stellen?', en:'Could you please turn the air conditioning down a bit?',
      alts:[{de:'Könnten Sie bitte das Fenster öffnen?',en:'Could you please open the window?'}] },
  ]},
  { id:'taxi', title:'Taking a taxi', steps:[
    { speaker:'you', de:'Zum Hauptbahnhof, bitte.', en:'To the main train station, please.', alts:[{de:'In die Torstraße 20, bitte.',en:'To Torstraße 20, please.'}] },
    { speaker:'staff', de:'Kein Problem. Ungefähr 15 Minuten.', en:'No problem. About 15 minutes.' },
    { speaker:'you', de:'Was kostet das ungefähr?', en:'How much will that cost roughly?' },
    { speaker:'staff', de:'Etwa 12 bis 15 Euro, je nach Verkehr.', en:'About 12 to 15 euros, depending on traffic.' },
    { speaker:'you', de:'Kann ich mit Karte zahlen?', en:'Can I pay by card?' },
    { speaker:'staff', de:'Ja, kein Problem.', en:'Yes, no problem.', alts:[{de:'Nur Bargeld, leider.',en:'Cash only, I\'m afraid.'}] },
  ]},
  { id:'bus', title:'Asking about the bus', steps:[
    { speaker:'you', de:'Fährt dieser Bus zum Alexanderplatz?', en:'Does this bus go to Alexanderplatz?',
      alts:[{de:'Hält dieser Bus am Prenzlauer Allee?',en:'Does this bus stop at Prenzlauer Allee?'}] },
    { speaker:'staff', de:'Ja, in etwa 10 Minuten.', en:'Yes, in about 10 minutes.',
      alts:[{de:'Nein, Sie müssen in die andere Richtung.',en:'No, you need to go in the other direction.'}] },
    { speaker:'you', de:'Gibt es eine Ansage?', en:'Is there an announcement?' },
    { speaker:'staff', de:'Ja, die Haltestellen werden angesagt.', en:'Yes, the stops are announced.' },
  ]},
];
