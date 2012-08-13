require('../../').compile(module, function () {
    module.exports.inConsequent = function () {
        var result = null;
        if (true) {
            result = await(Q.delay('f', 2)) + 'oo';
        }
        result.should.equal('foo');
        return result;
    };
    module.exports.inAlternate = function () {
        var result = null;
        if (false) {

        } else {
            result = await(Q.delay('f', 2)) + 'oo';
        }
        result.should.equal('foo');
        return result;
    };
    module.exports.inCondition = function inCondition() {
        if (await(Q.delay(false, 5))) {
            return 'bar';
        } else {
            return 'foo';
        }
    };
    module.exports.inAllThree = function inAllThree(foo) {
        if (await(Q.delay(false, 5))) {
            return await('bar');
        } else {
            return await(Q.delay('f', 2)) + 'oo';
        }
    }
});