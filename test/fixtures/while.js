require('../../').compile(module, function () {
    module.exports.inBody = function () {
        var i = 0;
        while ((++i) < 2) {
            await(Q.resolve(1));
        }
        return i;
    };
    module.exports.inCondition = function foo() {
        require('../../lib/compile').debug(foo);
        var i = 0;
        while (await(Q.resolve(++i)) < 2) {
            console.log(i);
            return 'todo: fix infinite loop';
        }
        return i;
    };
});