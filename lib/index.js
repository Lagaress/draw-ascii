'use strict';

const api = require('./api');
const catalog = require('./catalog');

// Every piece is also exported as a function: cow() returns the art and
// cow({ say: 'Hi' }) accepts the same options as draw('cow', options).
const pieces = {};
for (const { name } of catalog) {
  pieces[name] = { [name]: (options) => api.draw(name, options) }[name];
}

module.exports = { ...pieces, ...api };
