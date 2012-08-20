require('../../').compile(module, function () {
    module.exports.ran = true;

    module.exports.withoutCallingAwait = function () {
        if (false) {
            await('foo');
        }
        return 'bar';
    };
});