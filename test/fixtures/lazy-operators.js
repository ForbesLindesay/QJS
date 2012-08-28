require('../../').compile(module, function f() {
    //debug(f);
    module.exports.normalOperation = function () {
        var a = yield(Q.resolve(true)) && yield(Q.delay(true, 0));
        var b = yield(Q.resolve(false)) || yield(Q.delay(true, 0));
        var c = yield(Q.resolve(true)) || yield(Q.delay(false, 0));

        var d = yield(Q.resolve(false))
        return a && b && c;
    };
    module.exports.lazyAndOperation = function () {
        false && yield(notCalled());//test currently fails
    };
    function notCalled() {
        throw new Error('shouldn\'t be called');
    }
});