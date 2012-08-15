//console.log('===============================         start         ==================================');

var falafel = require('falafel');
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

compiler(methodToCompile);
//debug(compiler(methodToCompile));

function methodToCompile(foo, bar) {
    var method = function (foo, bar) {
        if (true) await(foo);
        return 'bar';
    };
};
function methodOuter(foo, bar) {
    function methodInner(step, err, results) {
        if(err) throw err;
        switch (step) {
            case 0:
                console.log(foo);
                console.log(bar);
                return await(Q.delay(500).then(function () { throw (new Error('prom')); }), 0, 1);
            case 1:
                console.log(results[0]);
                return 'done';
        }
    };
};

function compile(module, fn) {
  if (arguments.length !== 2) throw new Error('Compile must be supplied with exactly 2 arguments: a module object and a function to compile.')
  var locals = {};
  locals.await = await;
  locals.Q = Q;
  locals[secretPrefix + 'stack'] = { lineno: 1, input: fn.toString(), filename: module.filename};
  locals[secretPrefix + 'substack'] =  locals[secretPrefix + 'stack'];
  locals[secretPrefix + 'rethrow'] = rethrow;
  locals[secretPrefix + 'async'] = async;

  var compiled = comp(module, fn, compiler, locals);


  //console.log(module.filename);
  //debug(compiled);


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
