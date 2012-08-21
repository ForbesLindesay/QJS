[![Build Status](https://secure.travis-ci.org/ForbesLindesay/QJS.png?branch=master)](http://travis-ci.org/ForbesLindesay/QJS)

QJS
===

QJS adds an await keyword for use with Q promises.  To use it, you must 'compile' your code.  Unfortunately this somewhat destroy's your stack traces at the moment.  I'd really like to come up with a way of repairing them. Other than that though, it's pretty much perfect.

Hello World Example
-------------------

PromisedMath.js

```javascript
require('qjs').compile(module, function () {
    //All your module code must go in here.

    module.exports.add = function (a, b) {
        return await(a) + await(b);
    };
});
```

Consumer.js

```javascript
var Q = require('q');
var math = require('./PromisedMath');
math.add(Q.delay(3, 5000), Q.delay(2, 5000)).then(console.log).end();
```

If you ran consumer.js, it would create a _promise_ for `2` and a _promise_ for `3`.  These promises both take 5 seconds to resolve (you could imagine them being pulled from a server).  The add method recieves both promises and then waits (sequentially) for both to be resolved before adding them together.  We then log the output of 5.

Because the time starts when we create the promise, it is not important that we then wait for them sequentially.

Useful Example
---------------------

api.js

```javascript
var Q = require('q');
var api = require('api');
module.exports.getNextMessage = Q.nbind(api.getNextMessage);
```

index.js

```javascript
require('qjs').compile(module, function () {
    //All your module code must go in here.
    var api = require('./api');
    function run() {
        while (message = await(api.getNextMessage())) {
            console.log(message);
        }
    };
});
```

API
---

The `qjs` library consists of a single function that compiles code that contains await into code that can run asyncronously.  If any part of a module requires use of await like keywords, the whole module should be wrapped by the qjs compiler.

Inside the compiler you have access to `await` which will return the result of a promise, once it has been resolved.  You also get access to `Q` which is the promise library and simply saves you putting `var Q = require('q');` at the top of your file.

Contributing
------------

Please fork and update this project, it's very much a work in progress, but hopefully someone will find it useful.

Unsupported Features
--------------------

I will accept pull requests that fix these, and I intend to fix all of them in the near future.  In the mean time, if I find it and can't fix it I document it.

 - Await in catch blocks
 - Finally blocks where there's an await in the try block (or the finally block)
 - Lazy operations such as `&&` and `||` are not always as lazy as they should be if there's an await on the right hand side of the expression.
 - Select Case with an await statement in it.
 - `arguments` is not useable inside functions that contain the await keyword.
 - Recursion doesn't work properly for functions with await in them.