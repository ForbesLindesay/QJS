var falafel = require('falafel');
var Q = require('q');
var comp = require('./compile');

var secretPrefix = '_qjsgeneratedcode_';

function compile(module, fn) {
  var locals = {};
  locals.await = await;
  locals.Q = Q;
  locals[secretPrefix + 'stack'] = { lineno: 1, input: fn.toString(), filename: module.filename};
  locals[secretPrefix + 'rethrow'] = rethrow;
  locals[secretPrefix + 'async'] = async;

  comp(module, fn, compiler, locals)();
}

module.exports = compile;