
/**
 * Await result represents a result to be awaited on, it is not exposed so can only be produced by calling await.
 *
 * It's purpose is to distinguish a function that awaits a promise, from a funciton that simply returns a promise.
 * 
 * @param {promise} val      The promise to await.
 * @param {number}  id       The id number of the promise, this MUST be unique within a function.
 * @param {number}  nextStep The id number of the next step in the function, so it can return to the apropriate place.
 */
function AwaitResult(val, id, nextStep) {
  this.val = val;
  this.id = id;
  this.nextStep = nextStep;
}

module.exports.await = await;
function await(val, id, nextStep) {
  return new AwaitResult(val, id, nextStep);
}

module.exports.rethrow = rethrow;
function rethrow(err, stack){
  var str = stack.input;
  var filename = stack.filename;
  var lineno = stack.lineno;

  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Unknown File') + ':' 
    + lineno + '\n'  
    + context + '\n\n' 
    + err.message;
  
  throw err;
}

module.exports.async = async;
function async(fn) {
  return function async() {
    var fun = fn.apply(this, arguments);
    var nextStep = 0;
    var err = null;
    var awaitResults = {};
    function async() {
      var result = fun(nextStep, err, awaitResults);
      if (result instanceof AwaitResult) {
        nextStep = result.nextStep;
        err = null;
        return result.val.then(function (v) {
          awaitResults[result.id] = v;
        }, function (e) {
          err = e;
        }).then(async);
      } else {
        return result;
      }
    }
    return async();
  };
}