require('../').compile(module, function () {
    module.exports.runTests = function (describe, it) {

var assert = require('should');
function fixture(name) {
    try {
        var res = require('./fixtures/' + name);
        if (typeof res === 'function') {
            require('../').compile(res.module, res);
        }
        return res;
    } catch (ex) {
        throw new Error(ex.message + '\n in fixture ' + name);
    }
}

describe('code without `await`', function () {
    it('runs exactly as it normally would', function () {
        fixture('runs').ran.should.equal(true);
    });
});

describe('code with an `await` that\'s not called', function () {
    it('always returns a promise', function () {
        return fixture('runs').withoutCallingAwait().then(function (res) {
            res.should.equal('bar');
        });
    });
});

describe('`return`', function () {
    var ret = fixture('return');
    it('works with a plain await', function () {
        assert.strictEqual(await(ret.run()), undefined);
    });
    it('works with a plain await true', function () {
        await(ret.run(true)).should.equal(true);
    });
    it('works with expressions', function () {
        await(ret.appendFoo('bar')).should.equal('barfoo');
    });
    it('works with actual promises', function () {
        await(ret.appendFoo(Q.delay('bar', 0))).should.equal('barfoo');
    });
    it('works with nested awaits', function () {
        await(ret.nested()).should.equal('foobarbash');
    });
});

describe('`while`', function () {
    var wh = fixture('while');
    describe('with await in body', function () {
        it('works', function () {
            await(wh.inBody()).should.equal(2);
        });
    });
    describe('with await in condition', function () {
        it('works', function () {
            await(wh.inCondition()).should.equal(4);
        });
    });
    describe('with lots of tasks in parallel', function () {
        it('is performant', function () {
            await(wh.inParallel());
        });
    });
});

describe('`if`', function fn() {
    var f = fixture('if');
    describe('with await in consequent', function () {
        it('works', function () {
            await(f.inConsequent()).should.equal('foo');
        });
    });
    describe('with await in alternate', function () {
        it('works', function () {
            await(f.inAlternate()).should.equal('foo');
        });
    });
    describe('with await in condition', function () {
        it('works', function () {
            await(f.inCondition()).should.equal('foo');
        });
    });
    describe('with await in all 3', function () {
        it('works', function () {
            await(f.inAllThree()).should.equal('foo');
        });
    });
});

describe('`with`', function () {
    var f = fixture('with');
    describe('with await in body', function () {
        it('works', function () {
            await(f.inBody()).should.equal('foobar');
        });
    });
    describe('with await in parameter', function () {
        it('works', function () {
            await(f.inParameter()).should.equal('foobar');
        });
    });
});

describe('`for`', function () {
    var f = fixture('for');
    describe('with await in init', function () {
        it('works', function () {
            await(f.inInit()).should.equal(3);
        });
    });

    describe('with await in body', function () {
        it('works', function () {
            await(f.inBody()).should.equal(3);
        });
    });

    describe('with await in condition', function () {
        it('works', function () {
            await(f.inCondition()).should.equal(3);
        });
    });

    describe('with await in update', function () {
        it('works', function () {
            await(f.inUpdate()).should.equal(3);
        });
    });
});

describe('`try` and `catch`', function () {
    var f = fixture('trycatch');
    describe('with a successful operation', function () {
        it('succeeds', function () {
            await(f.onSuccess()).should.equal(4);
        });
    });
    describe('with an unsuccessful operation', function () {
        it('catches the exception', function () {
            await(f.onFail()).should.equal('caught');
        });
    });
});

var lazyOps = fixture('lazy-operators');
describe('`&&`', function () {
    describe('with both awaits resulting in `true`', function () {
        it('works', function () {
            await(lazyOps.normalOperation()).should.equal(true);
        });
    });
});

    };
});

var Q = require('q');
function moch(fn) {
    return function run(done) {
        Q.when(fn(), function (res) {
            done(null, res);
        }, done).end();
    };
}
module.exports.runTests(describe, function itq(name, fn) {
    it(name, moch(fn));
});