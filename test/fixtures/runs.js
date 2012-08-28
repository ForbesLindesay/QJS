require('../../').compile(module, function () {
    module.exports.ran = true;

    module.exports.withoutCallingYield = function () {
        if (false) {
            yield('foo');
        }
        return 'bar';
    };
});