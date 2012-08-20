require('../../').compile(module, function () {
    //All your module code must go in here.
    var api = require('./api');
    function run() {
        var message;
        while (true) {
            var err = false;
            try {
                var message = await(api.getNextMessage());
                //Process the message here
                console.log(message);
            } catch (ex) {
                console.log('There was an error retrieving or processsing the latest message, trying again.');
                err = true;
            }
            if (err) {
                await(Q.delay(10));
            }
        }
    }
    run().end();
});