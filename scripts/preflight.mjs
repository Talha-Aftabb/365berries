#!/usr/bin/env node
/**
 * Pre-flight check. Run before sending the link, and again before going live.
 *
 *   node scripts/preflight.mjs            # preview: safe to send to the client
 *   node scripts/preflight.mjs --launch   # live: adds the launch-only gates
 *
 * Exits 1 if anything is blocking, so it can be wired into a deploy step.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const launch = process.argv.includes('--launch');
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
const read = (f) => readFileSync(join(root, f), 'utf8');

const blockers = [];
const warnings = [];
const passes = [];

/* ---------------------------------------------- 1. unfilled legal details */
const GAP = /\[(TO BE COMPLETED|PENDIENTE[^\]]*)\]/g;
let gaps = 0;
for (const p of pages) {
  const hits = read(p).match(GAP);
  if (!hits) continue;
  gaps += hits.length;
  // Visible markers are fine — helpful, even — in a pitch. They only block launch.
  const msg =
    `${p}: ${hits.length} unfilled legal placeholder(s) — ${[...new Set(hits)].join(', ')}\n` +
    `      LSSI-CE Art. 10 requires the registered office and Commercial Registry\n` +
    `      details. Only the client can supply these.`;
  (launch ? blockers : warnings).push(msg);
}
if (!gaps) passes.push('No unfilled legal placeholders');

/* ---------------------------------------------- 2. link preview */
let relativeOg = 0;
for (const p of pages) {
  const m = read(p).match(/<meta property="og:image" content="([^"]*)"/);
  if (m && !/^https?:\/\//.test(m[1])) relativeOg++;
}
if (relativeOg) {
  const msg =
    `og:image is relative on ${relativeOg} page(s). WhatsApp and Facebook will not\n` +
    `      resolve it, so the link shows as a bare text card.\n` +
    `      Fix: node scripts/set-domain.mjs https://your-domain`;
  (launch ? blockers : warnings).push(msg);
} else {
  passes.push('og:image is absolute on every page');
}

/* ---------------------------------------------- 3. indexing posture */
const noindexed = pages.filter((p) => /content="noindex/.test(read(p)));
const vercelNoindex = existsSync(join(root, 'vercel.json')) &&
  /X-Robots-Tag/.test(readFileSync(join(root, 'vercel.json'), 'utf8'));

if (launch) {
  if (noindexed.length) {
    blockers.push(
      `${noindexed.length} page(s) still carry <meta robots="noindex">: ${noindexed.join(', ')}\n` +
      `      Remove only once the client has approved the content.`
    );
  }
  if (vercelNoindex) {
    blockers.push('vercel.json still sends X-Robots-Tag: noindex — remove it to go live.');
  }
  if (!noindexed.length && !vercelNoindex) passes.push('Indexing is enabled');
} else {
  if (noindexed.length === pages.length && vercelNoindex) {
    passes.push('noindex active on all pages + headers (correct for a preview)');
  } else {
    blockers.push(
      'Preview is not fully protected from indexing. Every page needs\n' +
      '      <meta robots="noindex"> and vercel.json needs X-Robots-Tag.'
    );
  }
}

/* ---------------------------------------------- 4. assets */
for (const a of ['assets/og-image.jpg', 'assets/video-poster.jpg', 'styles.css', 'main.js', 'i18n.js']) {
  if (!existsSync(join(root, a))) blockers.push(`Missing asset: ${a}`);
}
passes.push('All referenced assets present');

/* ---------------------------------------------- 5. dead links */
let dead = 0;
for (const p of pages) dead += (read(p).match(/href="#"/g) || []).length;
if (dead) blockers.push(`${dead} placeholder href="#" link(s) still in the markup.`);
else passes.push('No dead placeholder links');

/* ---------------------------------------------- 6. unverified claims */
const CLAIMS = [
  ['Certifications', 'GLOBALG.A.P. / GRASP / BRCGS / IFS Food / Organic (EU) / Sedex in index.html',
    'HIGHEST RISK — these are real schemes. Publishing one the supply base does not hold is a legal exposure, not a typo.'],
  ['Availability calendar', 'CROPS in main.js', 'Industry-typical windows, not the client\'s actual ones. This is the section buyers will rely on.'],
  ['Origins', '7 countries + windows in index.html', 'Confirm which the client actually sources from.'],
  ['Headline stats', '04 lines / 07 origins / 12 months / 24h response', 'Invented plausible figures.'],
  ['Testimonials', '3 anonymised quotes in index.html', 'Placeholder. Replace with approved references or delete the section.'],
  ['Retention periods', 'privacy.html', '12 months / 6 years are assumptions; processor list is generic.'],
];

/* ---------------------------------------------- report */
const bar = '─'.repeat(72);
console.log(`\n365 Berries — pre-flight (${launch ? 'LIVE' : 'preview'})\n${bar}`);

for (const p of passes) console.log(`  PASS   ${p}`);
for (const w of warnings) console.log(`\n  WARN   ${w}`);
for (const b of blockers) console.log(`\n  BLOCK  ${b}`);

console.log(`\n${bar}\n  Needs the client's sign-off (cannot be checked automatically):\n`);
for (const [what, where, why] of CLAIMS) {
  console.log(`   ▢ ${what} — ${where}`);
  console.log(`     ${why}`);
}

console.log(`\n${bar}`);
if (blockers.length) {
  console.log(`  ${blockers.length} blocker(s). Not ready to ${launch ? 'go live' : 'send'}.\n`);
  process.exit(1);
}
console.log(`  No blockers. Ready to ${launch ? 'go live' : 'send to the client'}.`);
console.log(`  ${warnings.length ? warnings.length + ' warning(s) above.' : ''}\n`);
