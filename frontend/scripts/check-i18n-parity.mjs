#!/usr/bin/env node
/**
 * Vérifie la PARITÉ des clés de traduction entre messages/fr.json et messages/en.json.
 *
 * Échoue (exit 1) si une clé existe dans une langue mais pas dans l'autre — ce qui
 * provoque l'affichage de la clé brute dans l'UI pour la langue manquante.
 *
 * Le namespace `content.*` est IGNORÉ : clés héritées non référencées par le code
 * (destinées à un futur CMS) ; à traduire ou supprimer le jour où elles seront câblées.
 *
 * Usage : node scripts/check-i18n-parity.mjs   (ou `npm run i18n:check`)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const IGNORED_PREFIXES = ['content.']; // namespaces legacy non câblés

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function load(name) {
  return flatten(JSON.parse(readFileSync(join(root, 'messages', name), 'utf-8')));
}

const fr = load('fr.json');
const en = load('en.json');
const ignored = (k) => IGNORED_PREFIXES.some((p) => k.startsWith(p));

const frOnly = Object.keys(fr).filter((k) => !(k in en) && !ignored(k)).sort();
const enOnly = Object.keys(en).filter((k) => !(k in fr) && !ignored(k)).sort();

const report = (label, keys) => {
  if (!keys.length) return;
  console.error(`\n❌ ${keys.length} clé(s) ${label} :`);
  keys.forEach((k) => console.error(`   - ${k}`));
};

report('présentes en FR mais absentes en EN', frOnly);
report('présentes en EN mais absentes en FR', enOnly);

if (frOnly.length || enOnly.length) {
  console.error(`\nParité i18n ÉCHOUÉE (${frOnly.length + enOnly.length} divergence(s)).`);
  process.exit(1);
}
console.log(`✅ Parité i18n OK (${Object.keys(fr).length} clés FR / ${Object.keys(en).length} clés EN, namespace 'content' exclu).`);
