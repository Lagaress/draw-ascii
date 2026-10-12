#!/usr/bin/env node
'use strict';

const { parseArgs } = require('util');
const lib = require('../lib');

const HELP = `
Usage: draw-ascii [name] [options]

Draw a piece of ASCII art by name, or explore the catalog.

Examples:
  draw-ascii cow --say "Hello!"
  draw-ascii cat --think "..." --frame round
  draw-ascii --random --category animals --color rainbow
  draw-ascii cat dog duck               (side by side)
  draw-ascii --banner "Hi there"
  echo "piped text" | draw-ascii cow --say -

Catalog:
  -l, --list [category]   List names (optionally from one category)
  -c, --categories        List categories
  -s, --search <query>    Search by name, category or tag
  -i, --info <name>       Show metadata for a piece
  -r, --random            Draw a random piece
      --category <name>   Restrict --random to a category
      --tag <tag>         Restrict --random to a tag

Transformations:
      --say <text>        Speech bubble ("-" reads stdin)
      --think <text>      Thought bubble ("-" reads stdin)
      --width <n>         Bubble width (default 40)
  -f, --flip              Mirror horizontally
      --frame [style]     Border: ascii, single, double, round, bold, stars, hash
      --title <text>      Title for the frame
      --color <color>     red, green, blue, ..., rainbow or #rrggbb
      --scale <n>         Scale up by an integer factor
      --center            Center in the terminal
  -b, --banner <text>     Render big block letters
      --gap <n>           Spacing when drawing several pieces (default 2)

  -h, --help              Show this help
  -v, --version           Show the version

Colors are disabled when NO_COLOR is set.
`;

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
    process.stdin.on('error', reject);
  });
}

function columns(names) {
  const width = Math.max(...names.map((n) => n.length)) + 2;
  const perRow = Math.max(1, Math.floor((process.stdout.columns || 80) / width));
  const rows = [];
  for (let i = 0; i < names.length; i += perRow) {
    rows.push(names.slice(i, i + perRow).map((n) => n.padEnd(width)).join('').trimEnd());
  }
  return rows.join('\n');
}

async function main(argv) {
  // --frame and --list take an optional value, so normalise "--frame" alone to "--frame=ascii".
  const OPTIONAL = { '--frame': 'ascii', '--list': '', '-l': '' };
  const args = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg in OPTIONAL) {
      const takesNext = next !== undefined && !next.startsWith('-') && (arg !== '--frame' || /^[a-z]+$/.test(next) && !lib.get(next));
      args.push(`${arg === '-l' ? '--list' : arg}=${takesNext ? next : OPTIONAL[arg]}`);
      if (takesNext) i++;
    } else {
      args.push(arg);
    }
  }

  const { values: opts, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      list: { type: 'string' },
      categories: { type: 'boolean', short: 'c' },
      search: { type: 'string', short: 's' },
      info: { type: 'string', short: 'i' },
      random: { type: 'boolean', short: 'r' },
      category: { type: 'string' },
      tag: { type: 'string' },
      say: { type: 'string' },
      think: { type: 'string' },
      width: { type: 'string' },
      flip: { type: 'boolean', short: 'f' },
      frame: { type: 'string' },
      title: { type: 'string' },
      color: { type: 'string' },
      scale: { type: 'string' },
      center: { type: 'boolean' },
      banner: { type: 'string', short: 'b' },
      gap: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });

  const out = (text) => process.stdout.write(`${text}\n`);

  if (opts.help) return out(HELP.trim());
  if (opts.version) return out(require('../package.json').version);
  if (opts.categories) {
    return out(lib.categories.map((c) => `${c.padEnd(12)} ${lib.list(c).length}`).join('\n'));
  }
  if (opts.list !== undefined) return out(columns(lib.list(opts.list || undefined)));
  if (opts.search !== undefined) {
    const results = lib.search(opts.search);
    if (!results.length) throw new Error(`Nothing matches "${opts.search}"`);
    return out(columns(results.map((r) => r.name)));
  }
  if (opts.info) {
    const entry = lib.get(opts.info);
    if (!entry) lib.draw(opts.info); // throws with a "did you mean" hint
    return out(
      [
        entry.art,
        '',
        `name:     ${entry.name}`,
        `category: ${entry.category}`,
        `tags:     ${entry.tags.join(', ') || '-'}`,
        `size:     ${entry.width}x${entry.height}`,
        `artist:   ${entry.artist || 'unknown'}`,
      ].join('\n'),
    );
  }

  for (const key of ['say', 'think']) {
    if (opts[key] === '-') opts[key] = await readStdin();
  }

  const number = (value, name) => {
    if (value === undefined) return undefined;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) throw new Error(`--${name} must be a positive integer`);
    return n;
  };
  const drawOptions = {
    flip: opts.flip,
    say: opts.say,
    think: opts.think,
    width: number(opts.width, 'width'),
  };

  let art;
  if (opts.banner !== undefined) {
    art = lib.banner(opts.banner);
  } else if (opts.random) {
    art = lib.random({ category: opts.category, tag: opts.tag, ...drawOptions });
  } else if (positionals.length === 1) {
    art = lib.draw(positionals[0], drawOptions);
  } else if (positionals.length > 1) {
    art = lib.combine(
      positionals.map((name) => lib.draw(name, { flip: opts.flip })),
      { gap: number(opts.gap, 'gap') ?? 2 },
    );
    if (opts.say !== undefined) art = lib.say(art, opts.say, { width: drawOptions.width });
    else if (opts.think !== undefined) art = lib.think(art, opts.think, { width: drawOptions.width });
  } else {
    return out(HELP.trim());
  }

  if (opts.scale) art = lib.scale(art, number(opts.scale, 'scale'));
  if (opts.frame !== undefined) art = lib.frame(art, { style: opts.frame, title: opts.title });
  if (opts.center) art = lib.center(art);
  if (opts.color && !process.env.NO_COLOR) art = lib.color(art, opts.color);
  out(art);
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`draw-ascii: ${error.message}\n`);
  process.exitCode = 1;
});
