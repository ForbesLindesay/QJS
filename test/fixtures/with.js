require('../../').compile(module, function () {
    var obj = { result: 'foo' };
    module.exports.inBody = function () {
        with (obj) {
            return await(Q.resolve(result)) + 'bar';
        }
    };
    module.exports.inParameter = function () {
        with (await(Q.resolve(obj))) {
            return result + 'bar';
        }
    };
});