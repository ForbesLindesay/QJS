require('../../').compile(module, function () {
    module.exports.inBody = function () {
        var i = 0;
        while ((++i) < 2) {
            //await(Q.resolve(1));
            await(Q.delay(1))
        }
        return i;
    };
    module.exports.inCondition = function () {
        var i = 0;
        while (await(Q.resolve(++i)) < 4) {
        }
        return i;
    };

    module.exports.inParallel = function () {
        var promises = [];
        var i = 0;
        while (i < 100) {
            promises.push(Q.delay(1));
            i++;
        }
        i = 0;
        while (i < 100) {
            await(promises[i]);
            i++;
        }
    };
});