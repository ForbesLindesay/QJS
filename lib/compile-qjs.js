//console.log('===============================         start         ==================================');

var falafel = require('./falafel');
var Q = require('q');
var comp = require('./compile');
var debug = comp.debug;

var templatesetc = require('./templates');
var template = templatesetc.templates;
var constant = templatesetc.constants;
var errors = constant.errors;
var secretPrefix = templatesetc.secretPrefix;

var runtimeHelpers = require('./runtime-helpers');
var await = runtimeHelpers.await;
var rethrow = runtimeHelpers.rethrow;
var async = runtimeHelpers.async;

function compiler(fn) {
    var promiseID = 0;

    function useStackTrace(node) {
        if (node.type === 'BlockStatement' && node.parent && (node.parent.type === 'FunctionDeclaration' || node.parent.type === 'FunctionExpression')) {
            node.update(template.useStackTraceFunction({src: removeBraces(node.source())}));
        } else if (node.type === 'Program') {
            node.update(template.useStackTrace({src: node.source()}));
        }
    }


    return (function compiler(fn) {
        try {
            var source = (/^(function *\w*\([\w\,\ ]*\) *\{)([\w\W]*)(\})$/g).exec(fn);
            var output = source[2];
            output = falafel(output, require('./stages/a-blockify').transformNode).toString();
            output = falafel({source: output, loc: true}, require('./stages/b-addStackTrace').transformNode).toString();
            output = require('./stages/c-mainTransformation').compile(output);
            //debug(output);
            output = falafel(output, useStackTrace).toString();
            //debug(output);
            return source[1] + output + source[3];
        } catch (ex) {
            debug(output);
            throw ex;
        }
    }(fn));
}

function compile(module, locals, fn) {
  if (typeof fn === 'undefined' && typeof locals === 'function') {
    fn = locals;
    locals = {};
  }
  if (typeof module !== 'object') throw new Error('You must pass the module object to `qjs.compile`');
  if (typeof fn !== 'function') throw new Error('You must pass a function to compile.');

  var locals = {};
  locals.yield = await;
  locals.Q = Q;
  locals[secretPrefix + 'stack'] = { lineno: 1, input: fn.toString(), filename: module.filename};
  locals[secretPrefix + 'substack'] =  locals[secretPrefix + 'stack'];
  locals[secretPrefix + 'rethrow'] = rethrow;
  locals[secretPrefix + 'async'] = async;

  var compiled = comp(module, fn, compiler, locals);
  compiled();
}

module.exports = compile;

function removeBraces(str) {
    if (/^\{/g.test(str) && /\}$/g.test(str)) {
        return str.substr(1, str.length - 2);
    } else {
        return str;
    }
}

//console.log('===============================          end          ==================================');
