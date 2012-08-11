var qjs = require('./');
qjs(module, function () {
    module.exports.asyncMethod = function addbar(foo) {
        return 'foo' + await(Q.delay(foo, 2000));
    };
    module.exports.asyncMethod('bar').then(console.log).end();
});