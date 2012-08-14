require('../../').compile(module, function () {
    module.exports.run = function (foo) {
        return await(foo);
    };
    module.exports.appendFoo = function (foo) {
        return await(foo) + 'foo';
    };

    module.exports.nested = function () {
        return await(Q.delay(await(Q.delay('foo',1)) + 'bar', 1)) + 'bash';
    };
});