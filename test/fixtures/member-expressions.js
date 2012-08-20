require('../../').compile(module, function () {
    module.exports.run = function () {
        return await({foo:'bar'}).foo;
    };
});