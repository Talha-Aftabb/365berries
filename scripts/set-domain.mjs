#!/usr/bin/env node
/**
 * Stamp the live domain into every page.
 *
 *   node scripts/set-domain.mjs https://365berries-preview.vercel.app
 *
 * Makes og:image absolute and adds og:url + <link rel="canonical">, which is
 * what WhatsApp, LinkedIn, Slack and Facebook need to render a link preview —
 * they do not resolve relative image URLs. Safe to run repeatedly.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = process.argv[2];

if (!raw) {
  console.error('Usage: node scripts/set-domain.mjs https://your-domain.com');
  process.exit(1);
}

let origin;
try {
  origin = new URL(raw).origin;
} catch {
  console.error(`Not a valid URL: ${raw}\nInclude the scheme, e.g. https://example.com`);
  process.exit(1);
}

const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
let changed = 0;

for (const page of pages) {
  const path = join(root, page);
  let html = readFileSync(path, 'utf8');
  const before = html;

  // vercel.json sets cleanUrls, so /privacy.html 308s to /privacy. Canonical and
  // og:url must name the final URL, never one that redirects.
  const cleanUrls = /"cleanUrls"\s*:\s*true/.test(
    readFileSync(join(root, 'vercel.json'), 'utf8').toString()
  );
  const slug = cleanUrls ? page.replace(/\.html$/, '') : page;
  const canonical = page === 'index.html' ? `${origin}/` : `${origin}/${slug}`;

  // og:image -> absolute
  html = html.replace(
    /(<meta property="og:image" content=")([^"]*)(")/,
    (_m, a, _url, c) => `${a}${origin}/assets/og-image.jpg${c}`
  );

  // og:url — replace if present, otherwise insert just before og:image
  if (/<meta property="og:url"/.test(html)) {
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
  } else {
    html = html.replace(
      /(<meta property="og:image" content=")/,
      `<meta property="og:url" content="${canonical}">\n$1`
    );
  }

  // canonical link
  if (/<link rel="canonical"/.test(html)) {
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
  } else {
    html = html.replace(
      /(<link rel="stylesheet" href="styles\.css">)/,
      `<link rel="canonical" href="${canonical}">\n$1`
    );
  }

  if (html !== before) {
    writeFileSync(path, html);
    changed++;
    console.log(`  ✓ ${page.padEnd(14)} ${canonical}`);
  } else {
    console.log(`  – ${page.padEnd(14)} already up to date`);
  }
}

console.log(`\nStamped ${origin} into ${changed} file(s).`);
console.log('Verify the preview at https://www.opengraph.xyz/ — note WhatsApp caches');
console.log('previews hard, so test with a fresh URL rather than re-pasting the same one.');
