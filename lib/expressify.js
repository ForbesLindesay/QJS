var Q = require('q');

function ContinueNext(id) {
  this.id = id;
}
function continueNext(id) {
  return new ContinueNext(id);
}
var i = 0;
function expressify(fn) {
  var id = i++;
  if (i > 500000) i = 0;
  return function (req, res, next) {
    Q.when(fn(req, res, continueNext(id)), function (v) {
      if (v instanceof ContinueNext && v.id === id) next();
      //If the result isn't continue, the request has been dealt with so we don't call next.
    }, next).end();
  };
}
module.exports = expressify;