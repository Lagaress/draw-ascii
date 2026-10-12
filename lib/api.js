'use strict';

const catalog = require('./catalog');
const { BANNER_FONT, BANNER_HEIGHT } = require('./font');

const byName = new Map(catalog.map((entry) => [entry.name, entry]));
const categories = [...new Set(catalog.map((entry) => entry.category))];

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

const ANSI_RE = /\x1b\[[0-9;]*m/g;

const stripAnsi = (text) => String(text).replace(ANSI_RE, '');
const visibleWidth = (line) => [...stripAnsi(line)].length;
const toLines = (art) => String(art).split('\n');
const widthOf = (art) => Math.max(0, ...toLines(art).map(visibleWidth));
const padEnd = (line, width) => line + ' '.repeat(Math.max(0, width - visibleWidth(line)));
const trimLines = (lines) => lines.map((line) => line.replace(/\s+$/, '')).join('\n');

function assertString(value, label) {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a string, received ${value === null ? 'null' : typeof value}`);
  }
}

// ---------------------------------------------------------------------------
// Catalog lookups
// ---------------------------------------------------------------------------

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function suggest(name) {
  let best = null;
  let bestScore = Infinity;
  for (const candidate of byName.keys()) {
    const score = distance(name, candidate);
    if (score < bestScore) [best, bestScore] = [candidate, score];
  }
  return bestScore <= Math.max(2, Math.floor(name.length / 3)) ? best : null;
}

function entryOrThrow(name) {
  assertString(name, 'Art name');
  const entry = byName.get(name.toLowerCase());
  if (entry) return entry;
  const hint = suggest(name.toLowerCase());
  throw new Error(`Unknown art "${name}".${hint ? ` Did you mean "${hint}"?` : ''} Use list() to see every name.`);
}

function describe(entry) {
  return {
    name: entry.name,
    category: entry.category,
    tags: [...entry.tags],
    artist: entry.artist,
    art: entry.art,
    width: widthOf(entry.art),
    height: toLines(entry.art).length,
  };
}

/** Metadata for one piece, or undefined if it does not exist. */
function get(name) {
  const entry = typeof name === 'string' ? byName.get(name.toLowerCase()) : undefined;
  return entry && describe(entry);
}

/** Names of every piece, optionally restricted to one category. */
function list(category) {
  if (category !== undefined && !categories.includes(category)) {
    throw new Error(`Unknown category "${category}". Available: ${categories.join(', ')}`);
  }
  return catalog.filter((entry) => !category || entry.category === category).map((entry) => entry.name);
}

/** Pieces whose name, category or tags contain the query, best matches first. */
function search(query) {
  assertString(query, 'Search query');
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const score = (entry) => {
    if (entry.name === q) return 0;
    if (entry.tags.includes(q)) return 1;
    if (entry.name.includes(q)) return 2;
    if (entry.category === q) return 3;
    if (entry.tags.some((tag) => tag.includes(q))) return 4;
    return -1;
  };
  return catalog
    .map((entry) => [score(entry), entry])
    .filter(([s]) => s >= 0)
    .sort((a, b) => a[0] - b[0])
    .map(([, entry]) => describe(entry));
}

// ---------------------------------------------------------------------------
// Transformations. All of them take and return plain strings, so they compose.
// ---------------------------------------------------------------------------

const MIRROR = {
  '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[',
  '{': '}', '}': '{', b: 'd', d: 'b', p: 'q', q: 'p', '`': "'", "'": '`',
};

/** Mirrors art horizontally, swapping direction-sensitive characters. */
function flip(art) {
  assertString(art, 'Art');
  const lines = toLines(stripAnsi(art));
  const width = widthOf(art);
  const mirrored = lines.map((line) =>
    [...padEnd(line, width)].reverse().map((ch) => MIRROR[ch] || ch).join(''),
  );
  const indent = Math.min(...mirrored.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return trimLines(mirrored.map((line) => line.slice(indent)));
}

function wrap(text, width) {
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    let line = '';
    for (let word of paragraph.split(/\s+/).filter(Boolean)) {
      while ([...word].length > width) {
        if (line) lines.push(line), (line = '');
        lines.push([...word].slice(0, width).join(''));
        word = [...word].slice(width).join('');
      }
      if (!word) continue;
      if (!line) line = word;
      else if ([...line].length + 1 + [...word].length <= width) line += ` ${word}`;
      else lines.push(line), (line = word);
    }
    lines.push(line);
  }
  return lines;
}

function bubble(text, { width = 40, think = false } = {}) {
  const lines = wrap(text, Math.max(1, width));
  const inner = Math.max(...lines.map((l) => [...l].length));
  const edges = (i) => {
    if (think) return ['(', ')'];
    if (lines.length === 1) return ['<', '>'];
    if (i === 0) return ['/', '\\'];
    if (i === lines.length - 1) return ['\\', '/'];
    return ['|', '|'];
  };
  return [
    ` ${'_'.repeat(inner + 2)}`,
    ...lines.map((line, i) => {
      const [left, right] = edges(i);
      return `${left} ${line}${' '.repeat(inner - [...line].length)} ${right}`;
    }),
    ` ${'-'.repeat(inner + 2)}`,
  ];
}

function withBubble(art, text, options, think) {
  assertString(art, 'Art');
  if (text === undefined || text === null) throw new TypeError('Text for the speech bubble is required');
  const tailChar = think ? 'o' : '\\';
  let body = toLines(art);
  // Some pieces (like the cow) already include the bubble tail in their first lines.
  const builtInTail = options && options.tail;
  if (builtInTail) {
    if (think) body = body.map((line, i) => (i < builtInTail ? line.replace('\\', 'o') : line));
    body = body.map((line) => `    ${line}`);
  } else {
    body = [`    ${tailChar}`, `     ${tailChar}`, ...body.map((line) => `  ${line}`)];
  }
  return trimLines([...bubble(text, { ...options, think }), ...body]);
}

/** Adds a cowsay-style speech bubble above the art. */
function say(art, text, options = {}) {
  return withBubble(art, text, options, false);
}

/** Adds a cowsay-style thought bubble above the art. */
function think(art, text, options = {}) {
  return withBubble(art, text, options, true);
}

const FRAMES = {
  ascii: ['+', '-', '+', '|', '|', '+', '-', '+'],
  single: ['┌', '─', '┐', '│', '│', '└', '─', '┘'],
  double: ['╔', '═', '╗', '║', '║', '╚', '═', '╝'],
  round: ['╭', '─', '╮', '│', '│', '╰', '─', '╯'],
  bold: ['┏', '━', '┓', '┃', '┃', '┗', '━', '┛'],
  stars: ['*', '*', '*', '*', '*', '*', '*', '*'],
  hash: ['#', '#', '#', '#', '#', '#', '#', '#'],
};

/** Draws a border around the art. */
function frame(art, options = {}) {
  assertString(art, 'Art');
  const opts = typeof options === 'string' ? { style: options } : options;
  const { style = 'ascii', padding = 1, title } = opts;
  const chars = FRAMES[style];
  if (!chars) throw new Error(`Unknown frame style "${style}". Available: ${Object.keys(FRAMES).join(', ')}`);
  const [tl, top, tr, left, right, bl, bottom, br] = chars;

  const pad = Math.max(0, padding);
  const lines = toLines(art);
  const titleText = title ? ` ${title} ` : '';
  const inner = Math.max(widthOf(art) + pad * 2, visibleWidth(titleText) + 2);
  const blank = `${left}${' '.repeat(inner)}${right}`;
  const vertical = Math.floor(pad / 2);

  const topLine = titleText
    ? `${tl}${top}${titleText}${top.repeat(inner - visibleWidth(titleText) - 1)}${tr}`
    : `${tl}${top.repeat(inner)}${tr}`;

  return [
    topLine,
    ...Array(vertical).fill(blank),
    ...lines.map((line) => `${left}${' '.repeat(pad)}${padEnd(line, inner - pad)}${right}`),
    ...Array(vertical).fill(blank),
    `${bl}${bottom.repeat(inner)}${br}`,
  ].join('\n');
}

/** Places several pieces side by side. */
function combine(arts, options = {}) {
  if (!Array.isArray(arts) || !arts.length) throw new TypeError('combine() expects a non-empty array of strings');
  arts.forEach((art, i) => assertString(art, `Art at index ${i}`));
  const { gap = 2, align = 'bottom' } = options;
  if (!['top', 'center', 'bottom'].includes(align)) throw new Error(`align must be "top", "center" or "bottom"`);

  const blocks = arts.map(toLines);
  const height = Math.max(...blocks.map((b) => b.length));
  const columns = blocks.map((block) => {
    const width = widthOf(block.join('\n'));
    const missing = height - block.length;
    const before = align === 'top' ? 0 : align === 'bottom' ? missing : Math.floor(missing / 2);
    const filled = [...Array(before).fill(''), ...block, ...Array(missing - before).fill('')];
    return filled.map((line) => padEnd(line, width));
  });

  const rows = Array.from({ length: height }, (_, i) => columns.map((col) => col[i]).join(' '.repeat(gap)));
  return trimLines(rows);
}

/** Centers the art within the given width (defaults to the terminal width). */
function center(art, width) {
  assertString(art, 'Art');
  const target = width || (typeof process !== 'undefined' && process.stdout && process.stdout.columns) || 80;
  const offset = Math.max(0, Math.floor((target - widthOf(art)) / 2));
  return trimLines(toLines(art).map((line) => ' '.repeat(offset) + line));
}

/** Scales the art by repeating every character and line. */
function scale(art, factor = 2) {
  assertString(art, 'Art');
  if (!Number.isInteger(factor) || factor < 1) throw new RangeError('scale factor must be a positive integer');
  const lines = toLines(stripAnsi(art)).map((line) => [...line].map((ch) => ch.repeat(factor)).join(''));
  return trimLines(lines.flatMap((line) => Array(factor).fill(line)));
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37, gray: 90,
  brightRed: 91, brightGreen: 92, brightYellow: 93, brightBlue: 94, brightMagenta: 95, brightCyan: 96, brightWhite: 97,
};
const RAINBOW = [196, 208, 226, 46, 51, 21, 129];
const RESET = '\x1b[0m';

function colorCode(color) {
  if (COLORS[color]) return `\x1b[${COLORS[color]}m`;
  const hex = /^#?([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `\x1b[38;2;${n >> 16};${(n >> 8) & 255};${n & 255}m`;
  }
  throw new Error(`Unknown color "${color}". Use one of ${Object.keys(COLORS).join(', ')}, "rainbow" or a hex code like "#ff8800"`);
}

/** Colors the art for terminals using ANSI escape codes. */
function color(art, name) {
  assertString(art, 'Art');
  assertString(name, 'Color');
  const plain = stripAnsi(art);
  if (name === 'rainbow') {
    return toLines(plain)
      .map((line, row) => {
        let out = '';
        let current = null;
        [...line].forEach((ch, col) => {
          const code = RAINBOW[Math.floor((col + row) / 2) % RAINBOW.length];
          if (ch !== ' ' && code !== current) out += `\x1b[38;5;${(current = code)}m`;
          out += ch;
        });
        return current === null ? out : out + RESET;
      })
      .join('\n');
  }
  const code = colorCode(name);
  return toLines(plain)
    .map((line) => (line ? `${code}${line}${RESET}` : line))
    .join('\n');
}

// ---------------------------------------------------------------------------
// Banner text
// ---------------------------------------------------------------------------

/** Renders text in big block letters. */
function banner(text, options = {}) {
  assertString(text, 'Banner text');
  const { char = '#', gap = 1 } = options;
  const rows = [];
  for (const sourceLine of text.toUpperCase().split('\n')) {
    const glyphs = [...sourceLine].map(
      (ch) => BANNER_FONT[ch] || BANNER_FONT[ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || BANNER_FONT['?'],
    );
    for (let row = 0; row < BANNER_HEIGHT; row++) {
      rows.push(glyphs.map((g) => g[row]).join(' '.repeat(gap)).replace(/#/g, char));
    }
    rows.push('');
  }
  rows.pop();
  return trimLines(rows);
}

// ---------------------------------------------------------------------------
// High-level API
// ---------------------------------------------------------------------------

function applyOptions(entry, options = {}) {
  if (options === null || typeof options !== 'object') throw new TypeError('Options must be an object');
  let out = entry.art;
  if (options.flip) out = flip(out);
  if (options.say !== undefined) out = say(out, options.say, { width: options.width, tail: entry.tail });
  else if (options.think !== undefined) out = think(out, options.think, { width: options.width, tail: entry.tail });
  if (options.frame) out = frame(out, options.frame === true ? {} : options.frame);
  if (options.color) out = color(out, options.color);
  return out;
}

/** Returns a piece by name, optionally transformed. */
function draw(name, options) {
  return applyOptions(entryOrThrow(name), options);
}

/** Returns a random piece, optionally from one category or tag. */
function random(options = {}) {
  const { category, tag, ...drawOptions } = options;
  const pool = catalog.filter(
    (entry) => (!category || entry.category === category) && (!tag || entry.tags.includes(tag)),
  );
  if (!pool.length) throw new Error('No art matches the given filters');
  return applyOptions(pool[Math.floor(Math.random() * pool.length)], drawOptions);
}

module.exports = {
  draw,
  get,
  list,
  search,
  random,
  categories,
  say,
  think,
  flip,
  frame,
  combine,
  center,
  scale,
  color,
  banner,
  stripAnsi,
};
