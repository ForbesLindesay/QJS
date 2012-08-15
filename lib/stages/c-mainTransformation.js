var falafel = require('falafel');

var templatesetc = require('../templates');
var template = templatesetc.templates;
var constant = templatesetc.constants;
var errors = constant.errors;
var secretPrefix = templatesetc.secretPrefix;

var promiseID = 0;
var stepID = 1;


var statementTransformers = {};
var toTransformUsingParent = [
    'AssignmentExpression', 'BinaryExpression', 'CallExpression', 
    'UpdateExpression', 'ExpressionStatement', 'MemberExpression', 
    'ReturnStatement', 'VariableDeclarator', 'VariableDeclaration', 
    'LogicalExpression'];
toTransformUsingParent.forEach(function (key) {
    statementTransformers[key] = transformUsingParent;
});

function transformUsingParent(node) {
    if (node.needsToResolve && node.needsToResolve.length) {
        var toResolve = node.parent.needsToResolve || (node.parent.needsToResolve = []);
        node.needsToResolve.forEach(function (await) {
            toResolve.push(await);
        });
    }
    node.parent.needsTransformation = node.parent.needsTransformation || node.needsTransformation;
}

statementTransformers['IfStatement'] = function transformIfStatement(node) {
    node.update(template.ifElseStatement({
        test: node.test.source(),
        consequent: removeBraces(node.consequent.source()),
        alternate: node.alternate ? removeBraces(node.alternate.source()) : '',
        consequentStep: stepID++,
        alternateStep: stepID++,
        continueStep: stepID++
    }));
};
statementTransformers['WhileStatement'] = function transformWhileStatement(node) {
    var needsToResolve = [];
    if (node.needsToResolve && node.needsToResolve.length) {
        node.parent.needsTransformation = node.needsTransformation;
        var buffer = [];
        node.needsToResolve.forEach(function (promise) {
            needsToResolve.push({source: promise.source, id: promise.id, stepID: stepID++});
        });
        node.needsToResolve = null;
    } else {
        needsToResolve = null;
    }
    node.update(template.whileStatement({
        test: node.test.source(),
        body: removeBraces(node.body.source()),
        testStep: stepID++,
        consequentStep: stepID++,
        alternateStep: stepID++,
        needsToResolve: needsToResolve
    }));
};

statementTransformers['WithStatement'] = function transformWithStatement(node) {
    node.update(template.withStatement({
        object: node.object.source(),
        body: removeBraces(node.body.source()),
        innerStep: stepID++,
        continueStep: stepID++
    }));
};

statementTransformers['ForStatement'] = function transformForStatement(node) {
    var needsToResolveInit = [];
    var needsToResolveTest = [];
    var needsToResolveUpdate = [];
    if (node.needsToResolve && node.needsToResolve.length) {
        node.parent.needsTransformation = node.needsTransformation;
        var buffer = [];
        node.needsToResolve.forEach(function (promise) {
            var val = {source: promise.source, id: promise.id, stepID: stepID++};
            var name = secretPrefix + 'awaitResults[' + promise.id + ']';
            if (node.init.source().indexOf(name) !== -1) {
                needsToResolveInit.push(promise);
            } else if (node.test.source().indexOf(name) !== -1) {
                needsToResolveTest.push(val);
            } else if (node.update.source().indexOf(name) !== -1) {
                needsToResolveUpdate.push(val);
            } else {
                throw new Error('You seem to have an await doing something crazzzyyyy in a for statement.');//this should never actually be thrown...
            }
        });
        node.needsToResolve = needsToResolveInit;
    } else {
        needsToResolveTest = null;
        needsToResolveUpdate = null;
    }
    node.update(template.forStatement({
        init: node.init.source(),
        test: node.test.source(),
        increment: node.update.source(),
        body: removeBraces(node.body.source()),
        testStep: stepID++,
        incrementStep: stepID++,
        consequentStep: stepID++,
        alternateStep: stepID++,

        needsToResolveUpdate: needsToResolveUpdate,
        needsToResolve: needsToResolveTest
    }));
};

statementTransformers['TryStatement'] = function transformTryStatement(node) {
    if (node.finalizer) throw new Error('Finalizers aren\'t supported yet :(');
    node.update(template.tryStatement({
        body: removeBraces(node.block.source()),
        catches: node.handlers.map(function (h) {
            return h.source();
        }).join('\n'),

        innerStep: stepID++,
        continueStep: stepID++
    }));
};

function transformAwaitNode(node) {
    if (node.arguments.length < 1) throw new Error(errors.missingPromise + ':\n    ' + node.source());
    if (node.arguments.length > 1) throw new Error(errors.tooManyPromises + ':\n    ' + node.source());

    transformUsingParent(node);

    var parent = node.parent;
    while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'FunctionExpression') {
        parent = parent.parent;
    }
    if (!parent) throw new Error('You must put your await expression inside a function.');
    parent.asyncWrapNeeded = true;
    node.parent.needsTransformation = true;
    (node.parent.needsToResolve = (node.parent.needsToResolve || [])).push({id: promiseID, source: node.arguments[0].source()});

    var method = /^await/g.test(node.source())?'await':'';
    node.update(template.awaitResult({method: method, id: promiseID, step:0}));

    promiseID++;
}

module.exports.transformNode = transformNode;
function transformNode(node) {
    if (node.needsTransformation ||
        (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'await')
        ) {
        //console.log('work will be done');
    }
    if (node.type === 'VariableDeclaration') {
        var closure = node.parent;
        while (closure && !(closure.type === 'FunctionDeclaration' || closure.type === 'FunctionExpression')) {
            closure = closure.parent;
        }
        if (closure) {
            var addSemicolon = /\;$/g.test(node.source());
            var varsToDeclare = (closure.varsToDeclare = (closure.varsToDeclare || []));
            node.declarations.forEach(function (declaration) {
                varsToDeclare.push(declaration.id.name);
            });
            node.update('(' + node.source().replace(/^var/g, '   ').replace(/\;$/g, '') + ')' + (addSemicolon?';':''));
        }
    }

    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && /^await/g.test(node.source())) {
        node.update(node.source().replace(/^await/g, ''));
    }
    
    if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'await') {
        transformAwaitNode(node);
    } else if (node.asyncWrapNeeded) {
        var prefix = '';
        if (node.type === 'FunctionDeclaration') prefix = 'var ' + node.id.name + ' = ';
        node.body.update(template.innerStepFunction({
            vars: (node.varsToDeclare && node.varsToDeclare.length)?'var ' + node.varsToDeclare.join(', ') + ';':'',
            name: ((node.id && node.id.name)||''), 
            source: removeBraces(node.body.source())
        }));
        node.update(prefix + secretPrefix + 'async(' + node.source() + ')');
    } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
        if(node.varsToDeclare && node.varsToDeclare.length) {
            node.body.update('{\nvar ' + node.varsToDeclare.join(', ') + ';' + removeBraces(node.body.source()) + '\n}');
        }
    } else if (node.type === 'BlockStatement') {
        node.parent.needsTransformation = node.parent.needsTransformation || node.needsTransformation;
    } else if (node.needsTransformation) {
        node.parent.needsTransformation = node.needsTransformation;
        if (statementTransformers[node.type]) {
            statementTransformers[node.type](node);
        } else {
            console.log('Node type not handled: ' + node.type);
        }
    }

    if (node.needsTransformation && node.needsToResolve && node.needsToResolve.length && node.parent && node.parent.type === 'BlockStatement') {
        node.parent.needsTransformation = node.needsTransformation;
        var buffer = [];
        node.needsToResolve.forEach(function (promise) {
            buffer.push(template.await({source: promise.source, id: promise.id, stepID: stepID++}));
        });
        node.needsToResolve = null;
        node.update(buffer.join('') + node.source());
    }
}

module.exports.compile = compile;
function compile(source) {
    promiseID = 0;
    stepID = 1;
    return falafel(source, transformNode).toString();
}


function removeBraces(str) {
    if (/^\{/g.test(str) && /\}$/g.test(str)) {
        return str.substr(1, str.length - 2);
    } else {
        return str;
    }
}