console.log('========================================================================================');
console.log('===============================         start         ==================================');
console.log('========================================================================================');

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

function transformUsingParent(node) {
    var required = node.parent.awaitRequired || (node.parent.awaitRequired = []);
    node.awaitRequired.forEach(function (await) {
        required.push(await);
    });
    node.parent.mustTransform = node.parent.mustTransform || node.mustTransform;
}

function compiler(fn) {
    var promiseID = 0;

    var statementTransformers = {};
    var toTransformUsingParent = ['AssignmentExpression', 'BinaryExpression', 'CallExpression', 'UpdateExpression'];
    toTransformUsingParent.forEach(function (key) {
        statementTransformers[key] = transformUsingParent;
    });

    function addStackTace(node) {
        if (node.parent && node.parent.type === 'BlockStatement') {
            node.update(template.addStackTrace({line:node.loc.start.line, src: node.source()}));
        }
    }
    function useStackTrace(node) {
        function wrap(src) {
            return template.useStackTrace({src:src});
        }
        if (node.type === 'BlockStatement' && node.parent && (node.parent.type === 'FunctionDeclaration' || node.parent.type === 'FunctionExpression')) {
            node.update(wrap(node.source()));
        }
    }

    function transformNode(node) {
        if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'await') {
            if (node.arguments.length < 1) throw new Error(errors.missingPromise);
            if (node.arguments.length > 1) throw new Error(errors.tooManyPromises);
            node.update(template.awaitResult({id: promiseID}));
            promiseID++;
            var parent = node.parent;
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'FunctionExpression') {
                parent = parent.parent;
            }
            if (!parent) throw new Error('You must put your await expression inside a function.');
            parent.asyncWrapNeeded = true;
            node.parent.needsTransformation = true;
        } else if (node.asyncWrapNeeded) {
            var prefix = '';
            if (node.type === 'FunctionDeclaration') prefix = 'var ' + node.id.name + ' = ';

            node.body.update(template.innerStepFunction({
                name: ((node.id && node.id.name)||''), 
                source: node.body.source().replace(/^\{/g, '').replace(/\}$/g, '')
            }));
            node.update(prefix + secretPrefix + 'async(' + node.source() + ')');
        } else if (node.needsTransformation) {
            node.parent.needsTransformation = node.needsTransformation;
            if (statementTransformers[node.type]) {
                statementTransformers[node.type](node);
            }
        }
    }


    return (function compiler(fn) {
        var source = (/^(function *\w*\([\w\,\ ]*\) *\{)([\w\W]*)(\})$/g).exec(fn);
        var output = source[2];
        output = falafel({source: output, loc: true}, addStackTace).toString();

        output = falafel({source: output, loc: true}, transformNode).toString();
        comp.debug(output);
        output = falafel({source: output, loc: true}, useStackTrace).toString();
        //comp.debug(output);
        return source[1] + output + source[3];
    }(fn));
}

compiler(methodToCompile);
//comp.debug(compiler(methodToCompile));

function methodToCompile(foo, bar) {
    var method = function (foo, bar) {
        await(foo, bar);
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
  locals[secretPrefix + 'rethrow'] = rethrow;
  locals[secretPrefix + 'async'] = async;

  var compiled = comp(module, fn, compiler, locals);
  //comp.debug(compiled);
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


function promise() {
    var result = { type: 'promise' };
    result.resolve = function resolve(value) {
        result.value = value;
    };
    return result;
}
function join(array, separator) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].type === 'promise') {
            if (typeof array[i].value !== 'string') {
                throw new Error('Promise must be resolved before you join them.');
            }
            array[i] = array[i].value;
        }
    }
    return array.join(separator || '');
}

console.log('========================================================================================');
console.log('========================================================================================');
console.log('========================================================================================');