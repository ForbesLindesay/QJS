require('../../').compile(module, function () {
    var obj = { result: 'foo' };
    module.exports.inBody = function () {
        with (obj) {
            return await(Q.resolve(result)) + 'bar';
        }
    };
    module.exports.inParameter = function () {
        with (await(Q.delay(obj, 1))) {
            return result + 'bar';
        }
    };
});