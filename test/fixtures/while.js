require('../../').compile(module, function () {
    module.exports.inBody = function foo() {
        var i = 0;
        while ((++i) < 2) {
            await(Q.resolve(1));
                    console.log(' i is ');
        console.log(i);
        }
        require('../../lib/compile').debug(foo);
        console.log(' i is ');
        console.log(i);
        return i;
    };
    module.exports.inCondition = function () {
        var i = 0;
        while (await(Q.resolve(++i)) < 2) {
        }
        return i;
    };
});