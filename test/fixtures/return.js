require('../../').compile(module, function () {
    module.exports.run = function (foo) {
        return yield(foo);
    };
    module.exports.appendFoo = function (foo) {
        return yield(foo) + 'foo';
    };

    module.exports.nested = function () {
        return yield(Q.delay(yield(Q.delay('foo',1)) + 'bar', 1)) + 'bash';
    };
});