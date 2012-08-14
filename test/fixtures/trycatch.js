require('../../').compile(module, function () {
    var obj = { result: 'foo' };
    module.exports.onSuccess = function () {
        try {
            return await(Q.delay(4, 0));
        } catch (ex) {
            throw ex;
        }
    };
    module.exports.onFail = function () {
        try {
            return await(Q.reject(new Error('message')));
        } catch (ex) {
            return 'caught';
        }
    };
});