module.exports = compile;
function compile(module, fn, compiler, locals) {
    locals = locals || {};
    if (typeof module !== 'object') throw new Error('You must pass a module object to the compile funciton.');
    if (typeof fn !== 'function') throw new Error('You must pass a function to compile.');
    if (typeof compiler !== 'function') throw new Error('The compiler is not a function.');
    if (typeof locals !== 'object') throw new Error('If provided, locals should be an object.');

    var localsNames = [];
    var localsValues = [];
    Object.keys(locals).forEach(function (name) {
        localsNames.push(name);
        localsValues.push(locals[name]);
    });

    var output = compiler(fn.toString());
    try {
        var compiledFn = new Function(
            'require', 
            '__filename', 
            '__dirname', 
            'module', 
            'exports', 
            'require', 

            'debug',

            'return function(' + localsNames.join(', ') + ') { return ' + output + '}'
            );
        var result =  compiledFn(
            module.require, 
            module.filename, 
            require('path').dirname(module.filename),
            module, 
            module.exports, 
            module.require.bind(module),

            debug);
        return result.apply(null, localsValues);
    } catch (ex) {
        debug('return function(' + localsNames.join(', ') + ') { return ' + output + '}');
        throw ex;
    }
}

module.exports.debug = debug;
function debug(src) {
  var beautify = require('../helpers/beautify');
  src = src.toString().replace(/\;\;/g, ';').replace(/\;\;/g, ';').replace(/\;\;/g, ';');
  console.log(beautify.js_beautify(src, {preserve_newlines: true}));
}