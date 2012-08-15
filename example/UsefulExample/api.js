var Q = require('q');
var api = require('./node-api');
module.exports.getNextMessage = Q.nbind(api.getNextMessage);