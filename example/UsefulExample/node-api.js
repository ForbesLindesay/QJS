var i = 1;

module.exports.getNextMessage = function (cb) {
    setTimeout(function () {
        if (Math.random() > 0.2) {
            cb(null, 'Message Number ' + (i++));
        } else {
            cb(new Error('Simulating network failure'));
        }
    }, 1000); //simulate network connection to a queue
};