export const meta = { title: 'Döner Kebab', emoji: '🥙', description: 'Ordering at a Döner stand.', category: 'food' };
export const scenes = [{
  id: 'doner-order', title: 'Ordering a Döner',
  steps: [
    { speaker:'staff', de:'Was darf es sein?', en:'What can I get you?',
      alts:[{de:'Bitte schön?',en:'Yes, please?'},{de:'Was kann ich Ihnen bringen?',en:'What can I bring you?'}] },
    { speaker:'you', de:'Einen Döner, bitte.', en:'A döner, please.',
      alts:[{de:'Ich hätte gerne einen Döner.',en:'I would like a döner.'},{de:'Einen Döner mit allem, bitte.',en:'A döner with everything, please.'}] },
    { speaker:'staff', de:'Mit allem?', en:'With everything?',
      alts:[{de:'Scharf oder nicht scharf?',en:'Spicy or not spicy?'}] },
    { speaker:'you', de:'Ja, aber ohne Zwiebeln, bitte.', en:'Yes, but without onions, please.',
      alts:[{de:'Nicht zu scharf, bitte.',en:'Not too spicy, please.'},{de:'Mit Knoblauchsauce, bitte.',en:'With garlic sauce, please.'},{de:'Ohne Schafskäse, bitte.',en:'Without feta, please.'}] },
    { speaker:'staff', de:'Zum Mitnehmen oder hierbleiben?', en:'To take away or to eat here?',
      alts:[{de:'Für hier oder zum Mitnehmen?',en:'For here or to go?'}] },
    { speaker:'you', de:'Zum Mitnehmen, bitte.', en:'To take away, please.',
      alts:[{de:'Für hier, bitte.',en:'To eat here, please.'}] },
    { speaker:'staff', de:'Das macht fünf Euro, bitte.', en:'That\'s five euros, please.' },
    { speaker:'you', de:'Kann ich mit Karte zahlen?', en:'Can I pay by card?',
      alts:[{de:'Stimmt so.',en:'Keep the change.'}] },
  ],
}];
