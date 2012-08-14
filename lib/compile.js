module.exports = compile;
function compile(module, fn, compiler, locals) {

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
  console.log(beautify.js_beautify(src.toString(), {preserve_newlines: true}));
}