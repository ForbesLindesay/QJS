require('../../').compile(module, function () {
    module.exports.run = function r() {
        var comb = await({foo: 'bar'}).foo + 'foo';
        return await({foo:comb.replace(/foo/,'')}).foo;
    };
});