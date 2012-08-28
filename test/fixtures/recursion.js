require('../../').compile(module, function () {
    var Q = require('q');
    module.exports.fact = function fact(n) {
        if (n === 0) return 1;
        var next = yield(Q.resolve(n - 1));
        return yield(fact(next)) * n;
    };
    module.exports.all = function all() {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i] = yield(arguments[i]);
        }
        return arguments;
    };
});