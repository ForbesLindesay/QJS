require('../').compile(module, function () {
    module.exports.runTests = function (describe, it) {


var assert = require('should');
function fixture(name) {
    var res = require('./fixtures/' + name);
    if (typeof res === 'function') {
        require('../').compile(res.module, res);
    }
    return res;
}

describe('code without await', function () {
    it('runs', function () {
        fixture('runs').ran.should.equal(true);
    });
});
describe('`return`', function () {
    var f = fixture('return');
    it('works with a plain await', function (done) {
        assert.strictEqual(await(f.run()), undefined);
    });
    it('works with a plain await true', function (done) {
        await(f.run(true)).should.equal(true);
    });
    it('works with expressions', function (done) {
        await(f.appendFoo('bar')).should.equal('barfoo');
    });
    it('works with actual promises', function (done) {
        await(f.appendFoo(Q.delay('bar', 0))).should.equal('barfoo');
    });
});

describe('`while`', function () {
    var f = fixture('while');
    describe('with await in body', function () {
        it('works', function () {
            await(f.inBody()).should.equal(2);
        });
    });
    describe('with await in condition', function () {
        it('works', function () {
            await(f.inCondition()).should.equal(2);
        });
    });
});

describe('`if`', function () {
    var f = fixture('if');
    describe('with await in body', function () {
        it('works', function () {
            await(f.run());
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