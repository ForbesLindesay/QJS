require('../../').compile(module, function f() {
    debug(f);
    module.exports.normalOperation = function () {
        var a = await(Q.resolve(true)) && await(Q.delay(true, 0));
        var b = await(Q.resolve(false)) || await(Q.delay(true, 0));
        var c = await(Q.resolve(true)) || await(Q.delay(false, 0));

        var d = await(Q.resolve(false))
        return a && b && c;
    };
    module.exports.lazyAndOperation = function () {
        false && await(notCalled());//test currently fails
    };
    function notCalled() {
        throw new Error('shouldn\'t be called');
    }
});