import { pathToFileURL } from 'url';
import { join } from 'path';

const DATA_DIR = new URL('../src/data/', import.meta.url).pathname;
const FILES = ['doner','restaurant','supermarket','bakery','cafe',
  'transport','postamt','pharmacy','bank','doctor','admin','housing','airport'];

let errors = 0;
for (const name of FILES) {
  let mod;
  try { mod = await import(pathToFileURL(join(DATA_DIR, `${name}.js`))); }
  catch(e) { console.error(`FAIL ${name}.js: ${e.message}`); errors++; continue; }

  if (typeof mod.meta?.title !== 'string') { console.error(`FAIL ${name}.js: meta.title missing`); errors++; }
  if (!Array.isArray(mod.scenes) || !mod.scenes.length) { console.error(`FAIL ${name}.js: scenes must be a non-empty array`); errors++; continue; }

  for (const sc of mod.scenes) {
    if (!sc.id || !sc.title || !Array.isArray(sc.steps)) { console.error(`FAIL ${name}.js scene ${sc.id}: missing id/title/steps`); errors++; }
    for (const st of sc.steps) {
      if (!['staff','you'].includes(st.speaker) || !st.de || !st.en) { console.error(`FAIL ${name}.js ${sc.id}: step missing speaker/de/en`); errors++; }
    }
  }
  const totalSteps = mod.scenes.reduce((s,sc)=>s+sc.steps.length, 0);
  console.log(`OK  ${name}.js — ${mod.scenes.length} scene(s), ${totalSteps} steps`);
}
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
else console.log('\nAll dialogue files valid.');
