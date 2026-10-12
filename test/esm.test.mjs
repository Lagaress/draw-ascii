import test from 'node:test';
import assert from 'node:assert/strict';
import lib, { cow, draw, list } from '../lib/index.mjs';

test('ESM named and default exports match CommonJS', () => {
  assert.equal(cow(), lib.cow());
  assert.equal(draw('cow', { say: 'hi' }), lib.draw('cow', { say: 'hi' }));
  assert.equal(list().length, lib.list().length);
});
