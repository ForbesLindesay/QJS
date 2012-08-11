require('../../').compile(module, function () {
    module.exports.run = function (foo) {
        return await(foo);
    };
    module.exports.appendFoo = function (foo) {
        return await(foo) + 'foo';
    };
});