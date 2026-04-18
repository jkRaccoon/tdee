#!/usr/bin/env node
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const ensureDir = (p) => mkdirSync(dirname(p), { recursive: true });

const OG_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#064e3b"/>
      <stop offset="1" stop-color="#065f46"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#86efac"/>
      <stop offset="1" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(80, 90)">
    <rect x="0" y="0" width="90" height="90" rx="18" fill="url(#accent)"/>
    <g fill="#064e3b" stroke="#064e3b" stroke-width="4" stroke-linecap="round">
      <rect x="20" y="36" width="8" height="18" rx="2"/>
      <rect x="16" y="41" width="16" height="8" rx="2"/>
      <line x1="34" y1="45" x2="56" y2="45"/>
      <rect x="58" y="36" width="16" height="18" rx="2"/>
      <rect x="62" y="41" width="8" height="8" rx="2" fill="#86efac"/>
    </g>
  </g>
  <text x="80" y="270" font-family="Inter, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#ffffff" letter-spacing="-2">TDEE · Macro</text>
  <text x="80" y="355" font-family="Inter, -apple-system, sans-serif" font-size="64" font-weight="900" fill="url(#accent)" letter-spacing="-2">Daily Calories &amp; Protein</text>
  <text x="80" y="435" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="500" fill="#d1fae5">Mifflin-St Jeor &amp; Katch-McArdle · Goal-based macros</text>
  <text x="80" y="480" font-family="Inter, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#bbf7d0">Lose · Maintain · Gain · Cut presets</text>
  <text x="1120" y="580" text-anchor="end" font-family="Inter, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#86efac">tdee.bal.pe.kr</text>
</svg>`;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10b981"/>
      <stop offset="1" stop-color="#84cc16"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <g fill="white">
    <rect x="14" y="26" width="6" height="12" rx="2"/>
    <rect x="11" y="29" width="12" height="6" rx="2"/>
    <line x1="24" y1="32" x2="40" y2="32" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <rect x="41" y="26" width="12" height="12" rx="2"/>
    <rect x="44" y="29" width="6" height="6" rx="1" fill="#10b981"/>
  </g>
</svg>`;

ensureDir('public/og.png');
writeFileSync('public/favicon.svg', FAVICON_SVG);
console.log('✓ public/favicon.svg');
await sharp(Buffer.from(OG_SVG)).png().toFile('public/og.png');
console.log('✓ public/og.png');
await sharp(Buffer.from(FAVICON_SVG)).resize(512, 512).png().toFile('public/favicon.png');
console.log('✓ public/favicon.png');
