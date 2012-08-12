var falafel = require('falafel');
var Q = require('q');
var comp = require('./compile');
var qjs = require('../');

var secretPrefix = '_qjsgeneratedcode_';
var id = 0;

var statementTransformers = {};

function transformAwait(node) {
    if (node.arguments.length !== 1) throw new Error('Await must have exactly one argument');
    var awaitValue = node.arguments[0].source();
    var awaitID = secretPrefix + 'await_result_' + (id++);
    if (node.callee.range[0] < node.range[0]) node.callee.update('');
    node.update(awaitID);
    node.parent.mustTransform = true;
    if (!node.parent.awaitRequired) {
        node.parent.awaitRequired = {source: awaitValue, key: awaitID};
    } else {
        throw new Error('Await already required');
    }
}
function transformVariableDeclarator(node) {
    transformUsingParent(node);
    var fn = node.parent;
    while (!(fn.parent.type === 'FunctionExpression' || fn.parent.type === 'FunctionDeclaration') && fn.parent) {
        fn = fn.parent;
    }
    if (!(fn.parent.type === 'FunctionExpression' || fn.parent.type === 'FunctionDeclaration')) {
        return;
    }
    var vars = (fn.vars = fn.vars || []);
    node.declarations.forEach(function (decl) {
        vars.push(decl.id.name);
    });

    var addSemicolon = /\;$/g.test(node.source());
    node.update('(' + node.source().replace(/^var/g, '   ').replace(/\;$/g, '') + ')' + (addSemicolon?';':''));
}
statementTransformers['ReturnStatement'] = function transformReturnStatement(node) {
    if (node.awaitRequired) {
        node.update('return Q.when(' + node.awaitRequired.source + ', function _qjs(' + node.awaitRequired.key + ') { ' + node.source() + '});');
    }
    //node.parent.mustTransform = true;
};
statementTransformers['AssignmentExpression'] = transformUsingParent;
statementTransformers['BinaryExpression'] = transformUsingParent;
statementTransformers['UpdateExpression'] = transformUsingParent;
statementTransformers['CallExpression'] = transformUsingParent;

statementTransformers['MemberExpression'] = function transformMemberExpression(node) {
    if (node.parent.type === 'BlockStatement') transformExpressionStatement(node);
    else transformUsingParent(node);
}
statementTransformers['ExpressionStatement'] = transformExpressionStatement;

function transformExpressionStatement(node) {
    var supportedBlockStatements = {};
    supportedBlockStatements['FunctionDeclaration'] = true;
    supportedBlockStatements['FunctionExpression'] = true;
    supportedBlockStatements['WhileStatement'] = true;
    supportedBlockStatements['ForStatement'] = true;
    supportedBlockStatements['IfStatement'] = true;
    if (node.awaitRequired) {
        if (node.parent.type === 'BlockStatement' && supportedBlockStatements[node.parent.parent.type]) {
            node.update('return Q.when(' + node.awaitRequired.source + ', function _qjs(' + node.awaitRequired.key + ') { ' + node.source());
            node.parent.mustTransform = true;
            node.parent.addEndings = node.parent.addEndings ? node.parent.addEndings + 1 : 1;
        } else {
            console.log(node);
            console.log(node.parent.type);
            console.log(node.parent.parent.type);
        }
    } else {
        node.parent.mustTransform = node.parent.mustTransform || node.mustTransform;
    }
};
function transformBlockStatement(node) {
    node.parent.mustTransform = node.parent.mustTransform || node.mustTransform;
    var src = node.source();
    while (node.addEndings && (node.addEndings--)) {
        src += ')}';
    }
    if (node.vars) {
        src = src.replace(/^\{/g, '{var ' + node.vars.join(', ') + ';');
    }
    node.update(src);
};
statementTransformers['WhileStatement'] = function transformWhileStatement(node) {
    var test = node.test.source();
    if (node.awaitRequired) {
        test = 'Q.when(' + node.awaitRequired.source + ', function _qjs(' + node.awaitRequired.key + ') {return ' + test + '});';
    }
    node.update('return ' + secretPrefix + 'qjs' + '.while(function () { return ' + test + '; }).do(function ()  ' + node.body.source() + ')' + 
        '.continue().then(function () {');
    node.parent.mustTransform = true;
    node.parent.addEndings = node.parent.addEndings ? node.parent.addEndings + 1 : 1;
};
statementTransformers['ForStatement'] = function transformForStatement(node) {
    node.update('return ' + secretPrefix + 'qjs' + '.for(' + 
        node.init.source() + 
        ', function () { return ' + node.test.source() + 
        '; }, function () { return ' + node.update.source() + '; }).do(function ()  ' + node.body.source() + ')' + 
        '.continue().then(function () {');
    node.parent.mustTransform = true;
    node.parent.addEndings = node.parent.addEndings ? node.parent.addEndings + 1 : 1;
};
statementTransformers['IfStatement'] = function transformIfStatement(node) {
    var result = 'return ' + secretPrefix + 'qjs' + 
        '.if(' + node.test.source() + ').then(function () { '
        + removeBraces(node.consequent.source()) + '})'
    if (node.alternate) {
        result += '.else(function () { ' + removeBraces(node.alternate.source()) + '})';
    }
    result += '.continue().then(function () {';
    node.update(result);
    node.parent.mustTransform = true;
    node.parent.addEndings = node.parent.addEndings ? node.parent.addEndings + 1 : 1;
};

function transformUsingParent(node) {
    if (!node.parent.awaitRequired) {
        node.parent.awaitRequired = node.awaitRequired;
    } else {
        throw new Error('Await already required');
    }
    node.parent.mustTransform = node.parent.mustTransform || node.mustTransform;
}
function transformNode(node) {
    if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        if (node.awaitRequired) {
            console.log(node);
        }
    } else if (node.type === 'BlockStatement') {
        transformBlockStatement(node);
    } else if (node.type === 'VariableDeclaration') {
        transformVariableDeclarator(node);
    } else if (node.type === 'CallExpression' && node.callee && node.callee.name === 'await'){
        return transformAwait(node);
    } else if (node.mustTransform) {
        if (statementTransformers[node.type]) {
            return statementTransformers[node.type](node);
        }
        console.log(node);
        console.log(node.awaitRequired);
    } else if (node.type === 'WhileStatement') {
        console.log(node);
    }
}
function compiler( fn) {
    var split = (/^(function *\w*\([\w\,\ ]*\) *\{)([\w\W]*)(\})$/g).exec(fn);
    var source = split[2];
    var output = source;

    output = falafel(output, transformNode).toString();
    //comp.debug(output);
    return split[1] + output + split[3];
}

function compile(module, fn) {
  if (arguments.length !== 2) throw new Error('Compile must be supplied with exactly 2 arguments: a module object and a function to compile.')
  var locals = {};
  locals.await = await;
  locals.Q = Q;
  locals[secretPrefix + 'stack'] = { lineno: 1, input: fn.toString(), filename: module.filename};
  locals[secretPrefix + 'rethrow'] = rethrow;
  locals[secretPrefix + 'qjs'] = qjs;

  var compiled = comp(module, fn, compiler, locals);
  //comp.debug(compiled);
  compiled();
}

module.exports = compile;

function await(val) {
    return val;
}
function rethrow(err) {
    throw err;
}

function removeBraces(str) {
    if (/^\{/g.test(str) && /\}$/g.test(str)) {
        return str.substr(1, str.length - 2);
    } else {
        return str;
    }
}