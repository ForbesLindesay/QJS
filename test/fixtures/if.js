require('../../').compile(module, function () {
    module.exports.run = function (foo) {
        var result = null;
        if (true) {
            result = await(foo);
        }
        return result;
    };
    module.exports.inCondition = function (foo) {
        if (await(foo)) {
            return 1;
        }
    };
    require('../../compile').debug(module.exports.inCondition);
});