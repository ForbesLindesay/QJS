require('../../').compile(module, function () {
    var Q = require('q');
    module.exports.fact = function fact(n) {
        var next = Q.delay(n - 1, 1);
        return await(fact(next)) * n;
    };
});