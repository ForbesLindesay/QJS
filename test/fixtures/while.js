require('../../').compile(module, function () {
    module.exports.inBody = function () {
        var i = 0;
        while ((++i) < 2) {
            await(Q.resolve(1));
        }
        return i;
    };
    module.exports.inCondition = function () {
        var i = 0;
        while (await(Q.resolve(++i)) < 2) {
        }
        return i;
    };
});