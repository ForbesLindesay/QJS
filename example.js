var qjs = require('./');
qjs.compile(module, function () {
    //Everybody loves a comment
    function foo() {
        for (var x = 1,y=10; x < 11; x++) {
            await(Q.delay(x* 200));
            console.log(x);
        }
        return 'foo';
    }
    foo(Q.delay('bar', 1000)).then(console.log).end();
});