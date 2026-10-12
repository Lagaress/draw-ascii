'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const lib = require('../lib');

const BIN = path.join(__dirname, '..', 'bin', 'draw-ascii.js');
const run = (args, input) =>
  spawnSync(process.execPath, [BIN, ...args], { input, encoding: 'utf8', env: { ...process.env, NO_COLOR: '' } });

test('draws a piece by name', () => {
  const { stdout, status } = run(['cow']);
  assert.equal(status, 0);
  assert.equal(stdout, `${lib.cow()}\n`);
});

test('applies transformations', () => {
  assert.equal(run(['cat', '--say', 'hi', '--frame', 'round']).stdout, `${lib.cat({ say: 'hi', frame: 'round' })}\n`);
  assert.equal(run(['--frame', 'cat']).stdout, `${lib.frame(lib.cat())}\n`);
  assert.equal(run(['duck', '-f']).stdout, `${lib.flip(lib.duck())}\n`);
});

test('reads bubble text from stdin', () => {
  assert.equal(run(['duck', '--say', '-'], 'piped\n').stdout, `${lib.duck({ say: 'piped' })}\n`);
});

test('combines several pieces', () => {
  assert.equal(run(['cat', 'duck']).stdout, `${lib.combine([lib.cat(), lib.duck()])}\n`);
});

test('lists, searches and shows info', () => {
  assert.match(run(['--list', 'tools']).stdout, /hammer/);
  assert.match(run(['--list']).stdout, /zebra/);
  assert.match(run(['--categories']).stdout, /^animals\s+\d+/m);
  assert.match(run(['--search', 'farm']).stdout, /pig/);
  assert.match(run(['--info', 'bee']).stdout, /artist: {3}jgs/);
});

test('respects NO_COLOR', () => {
  const colored = spawnSync(process.execPath, [BIN, 'cat', '--color', 'red'], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  assert.equal(colored.stdout, `${lib.cat()}\n`);
  assert.match(run(['cat', '--color', 'red']).stdout, /\x1b\[31m/);
});

test('fails with a helpful message', () => {
  const { stderr, status } = run(['kow']);
  assert.equal(status, 1);
  assert.match(stderr, /Did you mean "cow"/);
  assert.equal(run(['cat', '--scale', '0']).status, 1);
});

test('prints help with no arguments', () => {
  assert.match(run([]).stdout, /Usage: draw-ascii/);
});
