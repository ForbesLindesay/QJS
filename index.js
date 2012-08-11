var falafel = require('falafel');
var streamline = require('streamline/lib/callbacks/transform');
var streamlineRT = require('streamline/lib/callbacks/runtime');
var Q = require('q');

var secretPrefix = '_qjsgeneratedcode_';


function rethrow(err, stack){
  var str = stack.input;
  var filename = stack.filename;
  var lineno = stack.lineno;

  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Unknown File') + ':' 
    + lineno + '\n'  
    + context + '\n\n' 
    + err.message;
  
  throw err;
}

function addStackTrace(module, output) {
  var rethrow = 'catch (err) {' + secretPrefix + 'rethrow(err, ' + secretPrefix +'stack);}';
    var statement = /Statement$/g;
    output = falafel(output, function (node) {
        if (node.type === 'BlockStatement' && /Function/g.test(node.parent.type)) {
            node.update([
                '{try ',
                    node.source(),
                rethrow,
                '}'
            ].join("\n"));
        } else if (statement.test(node.type)) {
          if (node.parent.type === 'BlockStatement') {
            node.update(secretPrefix + 'stack.lineno = ' + node.loc.start.line + ';' + node.source());
          }
        }
    });
    // Adds the fancy stack trace meta info
    return str = [
        'try {',
        output,
        '} ', rethrow
    ].join("\n");
}

function async(fn, n) {
  return function async() {
    var args = Array.prototype.slice.call(arguments);
    while (args.length < n) {
      args.push(null);
    }
    return Q.nbind(fn).apply(this, args);
  }
}
function await(promise, cb) {
  if (Q.isFulfilled(promise)) {
    cb(null,  Q.nearer(promise));
  } else  {
    Q.when(promise, function (val) {
      cb(null, val);
    }, cb).end();
  }
}


function transformNode(node) {
  if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'await') {
    if (node.arguments.length < 1) throw new Error('You must provide a promise to await.');
    if (node.arguments.length > 1) throw new Error("You can't await more than one promise.");
    node.update(node.source().replace(/\)$/g, ', _)'));
    var parent = node.parent;
    while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'FunctionExpression') {
      parent = parent.parent;
    }
    if (!parent) throw new Error('You must put your await expression inside a function.');
    parent.asyncWrappNeeded = true;
  } else if (node.asyncWrappNeeded) {
      var prefix = '';
      if (node.type === 'FunctionDeclaration') prefix = 'var ' + node.id.name + ' = ';
      node.update(prefix + secretPrefix + 'async(' + node.source().replace(/^(function *\w*\([\w\,\ ]*)\)/g, 
        '$1' + (node.params.length > 0?', ':'') + '_)') + ', ' + node.params.length + ');');
  }
}


function compile(module, fn) {
    var split = (/^(function *\w*\([\w\,\ ]*\) *\{)([\w\W]*)(\})$/g).exec(fn.toString());
    var source = split[2];
    source = addStackTrace(module, source);
    var output = source;

    output = falafel(output, transformNode).toString();
    //debug(output);

    output = streamline.transform(output, {sourceName: module.filename});

    output = output.replace("require('streamline/lib/callbacks/runtime')", secretPrefix + 'rt');
    var compiledFn = new Function(
        //Locals that should be available inside a module.
        'require', 
        '__filename', 
        '__dirname', 
        'module', 
        'exports', 
        'require', 
        //Our special magic keyword
        'await',
        //A little bonus
        'Q',
        //Internal Methods
        secretPrefix + 'rt', 
        secretPrefix + 'stack', 
        secretPrefix + 'rethrow', 
        secretPrefix + 'async',  

        'return ' + split[1] + output + split[3]);
    var result =  compiledFn(
        //Locals that should be available inside a module.
        module.require, 
        module.filename, 
        require('path').dirname(module.filename),
        module, 
        module.exports, 
        module.require.bind(module),
        //Our special magic keyword 
        await, 
        //A little bonus
        Q, 
        //Internal Methods
        streamlineRT, 
        { lineno: 1, input: fn.toString(), filename: module.filename}, 
        rethrow, 
        async);
    //debug(output);
    result();
}

module.exports = compile;

function debug(src) {
  var beautify = require('./helpers/beautify');
  console.log(beautify.js_beautify(src.toString(), {preserve_newlines: false}));
}