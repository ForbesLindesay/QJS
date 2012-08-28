require('../../').compile(module, function () {
    module.exports.run = function r() {
        var comb = yield({foo: 'bar'}).foo + 'foo';
        return yield({foo:comb.replace(/foo/,'')}).foo;
    };
});