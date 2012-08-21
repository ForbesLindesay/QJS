require('../../').compile(module, function () {
    var Q = require('q');
    module.exports.fact = function fact(n) {
        if (n === 0) return 1;
        var next = await(Q.delay(n - 1, 1));
        return await(fact(next)) * n;
    };
    module.exports.all = function all() {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i] = await(arguments[i]);
        }
        return arguments;
    };
});