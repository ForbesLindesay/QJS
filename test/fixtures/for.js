require('../../').compile(module, function () {
    module.exports.inInit = function () {
        var x = 0;
        for (var i = await(Q.delay(0, 1)); i < 3; i++) {
            x++;
        }
        return x;
    };
    module.exports.inBody = function () {
        var x = 0;
        for (var i = 0; i < 1; i++) {
            x += await(Q.delay(3, 0));
        }
        return x;
    };
    module.exports.inCondition = function () {
        var x = 0;
        for (var i = 0; await(Q.delay(i, 0)) < 1; i++) {
            x += 3;
        }
        return x;
    };
    module.exports.inUpdate = function () {
        var x = 0;
        for (var i = 0; i < 1; i += await(Q.delay(1, 0))) {
            x+= 3;
        }
        return x;
    };
});