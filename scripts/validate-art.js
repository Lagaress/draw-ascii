#!/usr/bin/env node
'use strict';

// Lints the art/ folder without building: format, size and duplicate names.
// Usage: node scripts/validate-art.js [category...]

const fs = require('fs');
const path = require('path');

const ART_DIR = path.join(__dirname, '..', 'art');
const MAX_WIDTH = 60;
const MAX_HEIGHT = 25;
const only = process.argv.slice(2);
const errors = [];
const owners = new Map();
let count = 0;

for (const category of fs.readdirSync(ART_DIR).sort()) {
  const dir = path.join(ART_DIR, category);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.txt')) continue;
    const name = file.slice(0, -4);
    const where = `${category}/${file}`;
    if (owners.has(name)) errors.push(`${where}: name "${name}" already used in ${owners.get(name)}`);
    owners.set(name, category);
    if (only.length && !only.includes(category)) continue;
    count++;

    if (!/^[a-z][a-z0-9]*$/.test(name)) errors.push(`${where}: name must be lowercase alphanumeric`);
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) { errors.push(`${where}: missing frontmatter`); continue; }
    if (!/^tags: \S/m.test(match[1])) errors.push(`${where}: missing tags`);
    const body = match[2];
    if (/[^\x20-\x7e\n]/.test(body)) errors.push(`${where}: only printable ASCII allowed (no tabs/unicode)`);
    const lines = body.replace(/\n+$/, '').split('\n');
    const width = Math.max(...lines.map((l) => l.trimEnd().length));
    if (width > MAX_WIDTH) errors.push(`${where}: ${width} columns wide (max ${MAX_WIDTH})`);
    if (lines.length > MAX_HEIGHT) errors.push(`${where}: ${lines.length} lines tall (max ${MAX_HEIGHT})`);
    if (lines.filter((l) => l.trim()).length < 2) errors.push(`${where}: too small`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`${count} art files OK`);
