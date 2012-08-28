require('../../').compile(module, function () {
    module.exports.inBody = function () {
        var i = 0;
        while ((++i) < 2) {
            //yield(Q.resolve(1));
            yield(Q.delay(1))
        }
        return i;
    };
    module.exports.inCondition = function () {
        var i = 0;
        while (yield(Q.resolve(++i)) < 4) {
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
            yield(promises[i]);
            i++;
        }
    };
});