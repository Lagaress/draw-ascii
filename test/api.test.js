'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const lib = require('../lib');
const catalog = require('../lib/catalog');

test('every piece is exported as a function returning its art', () => {
  for (const { name, art } of catalog) {
    assert.equal(typeof lib[name], 'function', name);
    assert.equal(lib[name](), art, name);
  }
});

test('piece names never shadow API functions', () => {
  const api = require('../lib/api');
  for (const { name } of catalog) assert.ok(!(name in api), `"${name}" collides with the API`);
});

test('art is normalised: no tabs, no trailing spaces, no blank edges', () => {
  for (const { name, art } of catalog) {
    assert.ok(!art.includes('\t'), name);
    for (const line of art.split('\n')) assert.equal(line, line.trimEnd(), `${name} has trailing spaces`);
    assert.ok(art.split('\n')[0].trim(), `${name} starts with a blank line`);
    assert.ok(/\S$/.test(art), `${name} ends with whitespace`);
    assert.ok(art.split('\n').some((line) => !line.startsWith(' ')), `${name} is not dedented`);
  }
});

test('the 1.x catalog is still available', () => {
  const v1 = `cow pig chicken duck cat dog alligator ant bat bear bee bird bug bull camel panda seahorse sheep
    squirrel squid tapir toucan turkey zebra bacon beer cheese donut fish grapes milk pear pizza soup tea anchor
    bible bucket clock glasses microphone pen sofa spoon star tie towel typewriter hammer axe saw screwdriver
    wrench arrow cannon gun`.split(/\s+/);
  for (const name of v1) assert.ok(lib.get(name), name);
});

test('backslashes that 1.x silently dropped are preserved', () => {
  assert.ok(lib.bat().includes('(\\__/)'));
  assert.ok(lib.zebra().includes('/\\_/'));
  assert.ok(lib.sofa().includes('``````'));
});

test('draw() suggests close names for typos', () => {
  assert.throws(() => lib.draw('kow'), /Did you mean "cow"/);
  assert.throws(() => lib.draw('zzzzzzzzzz'), (error) => !/Did you mean/.test(error.message));
  assert.throws(() => lib.draw(42), TypeError);
  assert.equal(lib.draw('COW'), lib.cow());
});

test('get() returns metadata', () => {
  const bee = lib.get('bee');
  assert.equal(bee.category, 'animals');
  assert.equal(bee.artist, 'jgs');
  assert.equal(bee.height, bee.art.split('\n').length);
  assert.equal(lib.get('nope'), undefined);
});

test('list() and categories', () => {
  assert.equal(lib.list().length, catalog.length);
  for (const category of lib.categories) {
    assert.ok(lib.list(category).length > 0, category);
  }
  assert.throws(() => lib.list('nope'), /Unknown category/);
});

test('search() ranks exact names first and matches tags', () => {
  assert.equal(lib.search('cow')[0].name, 'cow');
  assert.ok(lib.search('farm').some((e) => e.name === 'pig'));
  assert.deepEqual(lib.search('   '), []);
});

test('random() honours filters', () => {
  const tools = new Set(lib.list('tools').map((n) => lib.get(n).art));
  for (let i = 0; i < 20; i++) assert.ok(tools.has(lib.random({ category: 'tools' })));
  assert.throws(() => lib.random({ tag: 'definitely-not-a-tag' }), /No art matches/);
});

test('say() wraps text and adds a tail', () => {
  const out = lib.say('X', 'one two three four', { width: 10 });
  assert.equal(
    out,
    [' ____________', '/ one two    \\', '\\ three four /', ' ------------', '    \\', '     \\', '  X'].join('\n'),
  );
  assert.equal(lib.say('X', 'hi').split('\n')[1], '< hi >');
  assert.match(lib.say('X', 'a'.repeat(12), { width: 5 }), /\/ aaaaa \\\n\| aaaaa \|\n\\ aa {4}\//);
});

test('think() uses round bubbles and circle tails', () => {
  const out = lib.think('X', 'hmm');
  assert.match(out, /\( hmm \)/);
  assert.match(out, /^ {4}o$/m);
});

test('pieces with a built-in tail are not given a second one', () => {
  const lines = lib.cow({ say: 'moo' }).split('\n');
  assert.equal(lines[3], '    \\   ^__^');
  assert.ok(lib.cow({ think: 'moo' }).split('\n')[3].startsWith('    o'));
});

test('flip() mirrors characters and is reversible for symmetric glyphs', () => {
  assert.equal(lib.flip('<(o )___'), '___( o)>');
  assert.equal(lib.flip('/\\'), '/\\');
  for (const name of ['cow', 'duck', 'cat', 'alligator']) {
    assert.equal(lib.flip(lib.flip(lib.draw(name))), lib.draw(name), name);
  }
});

test('frame() supports styles, padding and titles', () => {
  assert.equal(lib.frame('ab'), ['+----+', '| ab |', '+----+'].join('\n'));
  assert.equal(lib.frame('ab', { style: 'round', padding: 0 }), ['╭──╮', '│ab│', '╰──╯'].join('\n'));
  assert.equal(lib.frame('ab', 'double').split('\n')[0], '╔════╗');
  const titled = lib.frame('x', { title: 'long title' }).split('\n');
  assert.equal(titled[0], '+- long title -+');
  assert.ok(titled.every((l) => [...l].length === [...titled[0]].length));
  assert.throws(() => lib.frame('x', 'nope'), /Unknown frame style/);
});

test('frame() measures colored art by its visible width', () => {
  const plain = lib.frame('abc');
  assert.equal(lib.stripAnsi(lib.frame(lib.color('abc', 'red'))), plain);
});

test('combine() aligns pieces', () => {
  assert.equal(lib.combine(['a\nb', 'c'], { gap: 1 }), 'a\nb c');
  assert.equal(lib.combine(['a\nb', 'c'], { gap: 1, align: 'top' }), 'a c\nb');
  assert.equal(lib.combine(['a\nbbb\nc', 'x'], { align: 'center', gap: 1 }), 'a\nbbb x\nc');
  assert.throws(() => lib.combine([]), TypeError);
});

test('center() and scale()', () => {
  assert.equal(lib.center('ab', 6), '  ab');
  assert.equal(lib.scale('ab\nc', 2), 'aabb\naabb\ncc\ncc');
  assert.throws(() => lib.scale('a', 0), RangeError);
});

test('color() wraps lines in ANSI codes that stripAnsi() removes', () => {
  assert.equal(lib.color('ab\n\ncd', 'red'), '\x1b[31mab\x1b[0m\n\n\x1b[31mcd\x1b[0m');
  assert.equal(lib.color('a', '#ff8800'), '\x1b[38;2;255;136;0ma\x1b[0m');
  for (const name of ['cow', 'sofa']) {
    assert.equal(lib.stripAnsi(lib.draw(name, { color: 'rainbow' })), lib.draw(name));
  }
  assert.throws(() => lib.color('a', 'mauve'), /Unknown color/);
});

test('banner() renders 5-line block letters', () => {
  const out = lib.banner('Hi!');
  assert.equal(out.split('\n').length, 5);
  assert.equal(out.split('\n')[0], '#   # ### #');
  assert.equal(lib.banner('é'), lib.banner('E'));
  assert.equal(lib.banner('~'), lib.banner('?'));
  assert.equal(lib.banner('a\nb').split('\n').length, 11);
  assert.ok(lib.banner('I', { char: '@' }).startsWith('@@@'));
});

test('draw() applies options in a stable order', () => {
  const out = lib.draw('duck', { flip: true, say: 'hi', frame: 'round', color: 'green' });
  const plain = lib.stripAnsi(out);
  assert.equal(plain, lib.frame(lib.say(lib.flip(lib.duck()), 'hi'), 'round'));
  assert.throws(() => lib.draw('cow', 'red'), TypeError);
});
