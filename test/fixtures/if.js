require('../../').compile(module, function () {
    module.exports.inConsequent = function () {
        var result = null;
        if (true) {
            result = yield(Q.delay('f', 2)) + 'oo';
        }
        result.should.equal('foo');
        return result;
    };
    module.exports.inAlternate = function () {
        var result = null;
        if (false) {

        } else {
            result = yield(Q.delay('f', 2)) + 'oo';
        }
        result.should.equal('foo');
        return result;
    };
    module.exports.inCondition = function () {
        if (yield(Q.delay(false, 5))) {
            return 'bar';
        } else {
            return 'foo';
        }
    };
    module.exports.inAllThree = function (foo) {
        if (yield(Q.delay(false, 5))) {
            return yield('bar');
        } else {
            return yield(Q.delay('f', 2)) + 'oo';
        }
    }
});