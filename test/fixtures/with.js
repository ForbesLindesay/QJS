require('../../').compile(module, function () {
    var obj = { result: 'foo' };
    module.exports.inBody = function () {
        with (obj) {
            return yield(Q.resolve(result)) + 'bar';
        }
    };
    module.exports.inParameter = function () {
        with (yield(Q.delay(obj, 1))) {
            return result + 'bar';
        }
    };
});