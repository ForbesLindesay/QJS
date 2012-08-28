require('../').compile(module, function () {
    module.exports.runTests = function runTests(describe, it) {

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

describe('code without `yield`', function () {
    it('runs exactly as it normally would', function () {
        fixture('runs').ran.should.equal(true);
    });
});

describe('code with an `yield` that\'s not called', function () {
    it('always returns a promise', function () {
        return fixture('runs').withoutCallingYield().then(function (res) {
            res.should.equal('bar');
        });
    });
});

describe('`return`', function () {
    var ret = fixture('return');
    it('works with a plain yield', function () {
        assert.strictEqual(yield(ret.run()), undefined);
    });
    it('works with a plain yield true', function () {
        yield(ret.run(true)).should.equal(true);
    });
    it('works with expressions', function () {
        yield(ret.appendFoo('bar')).should.equal('barfoo');
    });
    it('works with actual promises', function () {
        yield(ret.appendFoo(Q.delay('bar', 0))).should.equal('barfoo');
    });
    it('works with nested yields', function () {
        yield(ret.nested()).should.equal('foobarbash');
    });
});

describe('`while`', function () {
    var wh = fixture('while');
    describe('with yield in body', function () {
        it('works', function () {
            yield(wh.inBody()).should.equal(2);
        });
    });
    describe('with yield in condition', function () {
        it('works', function () {
            yield(wh.inCondition()).should.equal(4);
        });
    });
    describe('with lots of tasks in parallel', function () {
        it('is performant', function () {
            yield(wh.inParallel());
        });
    });
});

describe('`if`', function fn() {
    var f = fixture('if');
    describe('with yield in consequent', function () {
        it('works', function () {
            yield(f.inConsequent()).should.equal('foo');
        });
    });
    describe('with yield in alternate', function () {
        it('works', function () {
            yield(f.inAlternate()).should.equal('foo');
        });
    });
    describe('with yield in condition', function () {
        it('works', function () {
            yield(f.inCondition()).should.equal('foo');
        });
    });
    describe('with yield in all 3', function () {
        it('works', function () {
            yield(f.inAllThree()).should.equal('foo');
        });
    });
});

describe('`with`', function () {
    var f = fixture('with');
    describe('with yield in body', function () {
        it('works', function () {
            yield(f.inBody()).should.equal('foobar');
        });
    });
    describe('with yield in parameter', function () {
        it('works', function () {
            yield(f.inParameter()).should.equal('foobar');
        });
    });
});

describe('`for`', function () {
    var f = fixture('for');
    describe('with yield in init', function () {
        it('works', function () {
            yield(f.inInit()).should.equal(3);
        });
    });

    describe('with yield in body', function () {
        it('works', function () {
            yield(f.inBody()).should.equal(3);
        });
    });

    describe('with yield in condition', function () {
        it('works', function () {
            yield(f.inCondition()).should.equal(3);
        });
    });

    describe('with yield in update', function () {
        it('works', function () {
            yield(f.inUpdate()).should.equal(3);
        });
    });
});

describe('`try` and `catch`', function () {
    var f = fixture('trycatch');
    describe('with a successful operation', function () {
        it('succeeds', function () {
            yield(f.onSuccess()).should.equal(4);
        });
    });
    describe('with an unsuccessful operation', function () {
        it('catches the exception', function () {
            yield(f.onFail()).should.equal('caught');
        });
    });
});

var lazyOps = fixture('lazy-operators');
describe('operators (`&&`, `||`)', function () {
    describe('when it doesn\'t matter if they support lazy evaluation', function () {
        it('works', function () {
            yield(lazyOps.normalOperation()).should.equal(true);
        });
    });
});
describe('`yield` with a member expression (e.g. `return yield({foo:\'bar\'}).foo`)', function () {
    it('works', function () {
        yield(fixture('member-expressions').run()).should.equal('bar');
    });
});

describe('recursion', function () {
    it('works like any other function call', function () {
        yield(fixture('recursion').fact(3)).should.equal(6);
    });
    it('can take arbitary arguments and use them like an array', function () {
        var res = yield(fixture('recursion').all(Q.delay(1,1), Q.delay(2,2)));
        res[0].should.equal(1);
        res[1].should.equal(2);
    });
});

//debug(runTests);
describe('`expressify`', function () {
    var Q = require('q');
    var QJS = require('../');
    describe('when you return continue', function () {
        it('calls next', function f() {
            return Q.ncall(function (done) {
                QJS.expressify(function (req, res, cont) {
                    yield(Q.delay(1));
                    return cont;
                })(null, null, done);
            });
        });
    });
    describe('when you return a value', function () {
        it('does nothing', function f() {
            return Q.ncall(function (done) {
                QJS.expressify(function (req, res, cont) {
                    return 'continue';
                })(null, null, function () {
                    done(new Error('Why did you call done?'));
                });
                setTimeout(function () {
                    done();
                }, 20);
            });
        });
    });
    describe('when you throw an error', function () {
        it('passes the error on to next', function f() {
            return Q.ncall(function (done) {
                QJS.expressify(function (req, res, cont) {
                    yield(Q.delay(1));
                    throw new Error('I just can\'t get used to something so right');
                })(null, null, function (err) {
                    if (err) {
                        done();
                    } else {
                        done(new Error('You should pass that error on.'));
                    }
                });
                setTimeout(function () {
                    done();
                }, 20);
            });
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