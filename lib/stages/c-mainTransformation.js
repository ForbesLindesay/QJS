var falafel = require('falafel');

var templatesetc = require('../templates');
var template = templatesetc.templates;
var constant = templatesetc.constants;
var errors = constant.errors;
var secretPrefix = templatesetc.secretPrefix;

var promiseID = 0;
var stepID = 1;


var statementTransformers = {};
var toTransformUsingParent = ['AssignmentExpression', 'BinaryExpression', 'CallExpression', 'UpdateExpression', 'ExpressionStatement', 'MemberExpression', 'ReturnStatement'];
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
    if (node.alternate) {
        node.update('if(' + node.test.source() + ') {' + secretPrefix + 'currentStep = ' + stepID + '} else {' + secretPrefix + 'currentStep = ' + (stepID + 1) + '}\nbreak;' + 
            '\ncase ' + stepID + ':' + removeBraces(node.consequent.source()) + secretPrefix + 'currentStep = ' + (stepID + 2) + '\nbreak;' +
            '\ncase ' + (stepID + 1) + ':' + removeBraces(node.alternate.source()) + secretPrefix + 'currentStep = ' + (stepID + 2) + '\nbreak;' + 
            '\ncase ' + (stepID + 2) + ':');
        stepID += 3;
    } else {
        node.update('if(' + node.test.source() + ') {' + secretPrefix + 'currentStep = ' + stepID + '} else {' + secretPrefix + 'currentStep = ' + (stepID + 1) + '}\nbreak;' + 
            '\ncase ' + stepID + ':' + removeBraces(node.consequent.source()) + secretPrefix + 'currentStep = ' + (stepID + 1) + '\nbreak;' +
            '\ncase ' + (stepID + 1) + ':');
        stepID += 2;
    }
};
statementTransformers['WhileStatement'] = function transformWhileStatement(node) {
    node.update(node.source());
};

function transformAwaitNode(node) {
    if (node.arguments.length < 1) throw new Error(errors.missingPromise + ':\n    ' + node.source());
    if (node.arguments.length > 1) throw new Error(errors.tooManyPromises + ':\n    ' + node.source());

/*
    if (!/await/g.test(node.source())) {
        console.log('===============await not present================');
        console.log(node.source());
        console.log(node);
        var p = node.parent;
        while (p && !/await/g.test(p.source())) {
            console.log('==parent==');
            console.log(p.source());
            console.log(p);
            p = p.parent;
        }
        if (p) {
            console.log('==final parent==');
            console.log(p.source());
            console.log(p);
        }
    }
 */
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

    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && /^await/g.test(node.source())) {
        node.update(node.source().replace(/^await/g, ''));
    }
    if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'await') {
        transformAwaitNode(node);
    } else if (node.asyncWrapNeeded) {
        var prefix = '';
        if (node.type === 'FunctionDeclaration') prefix = 'var ' + node.id.name + ' = ';

        node.body.update(template.innerStepFunction({
            name: ((node.id && node.id.name)||''), 
            source: node.body.source().replace(/^\{/g, '').replace(/\}$/g, '')
        }));
        node.update(prefix + secretPrefix + 'async(' + node.source() + ')');
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
            buffer.push('return await(' + promise.source + ', ' + promise.id + ', ' + stepID + ')');
            buffer.push('\ncase ' + stepID + ':' + '\nif(' + secretPrefix + 'err) { throw ' + secretPrefix + 'err; }');
            stepID++;
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