// src/data/gas.js
export const meta = {
  title: 'Gas Station',
  emoji: '⛽',
  description: 'Filling up at a German Tankstelle — self-service pump, paying inside, and asking for help',
  category: 'errands',
};

export const scenes = [
  {
    id: 'gas-pump',
    title: 'At the pump',
    steps: [
      {
        speaker: 'you',
        de: 'Wie funktioniert die Zapfsäule?',
        en: 'How does the pump work?',
        alts: [
          { de: 'Kann ich bar bezahlen?', en: 'Can I pay with cash?' },
          { de: 'Nehmen Sie Karte?', en: 'Do you accept card?' },
        ],
      },
      {
        speaker: 'staff',
        de: 'Einfach den Zapfhahn nehmen und tanken. Danach innen bezahlen.',
        en: 'Just take the nozzle and fill up. Then pay inside.',
        alts: [
          { de: 'Wählen Sie zuerst die Zapfsäulennummer aus.', en: 'Select your pump number first.' },
        ],
      },
      {
        speaker: 'you',
        de: 'Für voll, bitte.',
        en: 'Fill it up, please.',
        alts: [
          { de: 'Zwanzig Euro, bitte.', en: 'Twenty euros, please.' },
          { de: 'Fünfzig Liter, bitte.', en: 'Fifty litres, please.' },
        ],
      },
    ],
  },
  {
    id: 'gas-pay',
    title: 'Paying inside',
    steps: [
      {
        speaker: 'staff',
        de: 'Welche Zapfsäule?',
        en: 'Which pump?',
      },
      {
        speaker: 'you',
        de: 'Zapfsäule drei.',
        en: 'Pump three.',
        alts: [
          { de: 'Pumpe fünf.', en: 'Pump five.' },
        ],
      },
      {
        speaker: 'staff',
        de: 'Das macht vierzig Euro zwanzig.',
        en: 'That comes to forty euros twenty.',
      },
      {
        speaker: 'you',
        de: 'Mit Karte, bitte.',
        en: 'By card, please.',
        alts: [
          { de: 'Ich zahle bar.', en: 'I\'ll pay cash.' },
          { de: 'Haben Sie eine Quittung?', en: 'Can I have a receipt?' },
        ],
      },
    ],
  },
];
