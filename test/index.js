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
describe('operators (`&&`, `||`)', function () {
    describe('when it doesn\'t matter if they support lazy evaluation', function () {
        it('works', function () {
            await(lazyOps.normalOperation()).should.equal(true);
        });
    });
});
describe('`await` with a member expression (e.g. `return await({foo:\'bar\'}).foo`)', function () {
    it('works', function () {
        await(fixture('member-expressions').run()).should.equal('bar');
    });
});

describe('recursion', function () {
    it('works like any other function call', function () {
        await(fixture('recursion').fact(3)).should.equal(6);
    });
    it('can take arbitary arguments and use them like an array', function () {
        var res = await(fixture('recursion').all(Q.delay(1,1), Q.delay(2,2)));
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
                    await(Q.delay(1));
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
                    await(Q.delay(1));
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