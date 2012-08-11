var Q = require('q');

module.exports.not = not_qjs;
function not_qjs(promise) {
  return promise.then(function (value) {
    return !value;
  });
}

function continue_qjs(result) {
  return once_qjs(function continue_qjs() {
    return result;
  }, 'You should only continue from an expression once.');
}

module.exports.if = if_qjs;
function if_qjs(condition) {
  var thenfn, elsefn, continuation;
  var result = Q.when(condition, function next_qjs(condition) {
    if (condition && thenfn) {
      return thenfn();
    } else if (!condition && elsefn) {
      return elsefn();
    }
  });
  var cont = continue_qjs(result);

  function then_qjs(fn) {
    if (typeof fn !== 'function') throw new Error('Then body must be of type function.');
    thenfn = fn;
    return {else: once_qjs(else_qjs, 'You can only provide one body for an else statement.'), continue: cont};
  }

  function else_qjs(fn) {
    if (elsefn) throw new Error('You attempted to set the true part of an if statement twice.');
    if (typeof fn !== 'function') throw new Error('Else body must be of type function.');
    elsefn = fn;
    return {continue: cont};
  }

  return {
    then:once_qjs(then_qjs, 'You can only provide one body for an if statement.')
  };
};

module.exports.while = while_qjs;
function while_qjs(conditionfn) {
  if (typeof conditionfn !== 'function') throw new Error('The condition for a while expression must be wrapped in a function');

  function do_qjs(fn) {
    var result = when_qjs(conditionfn(), function (condition) {
      if (condition) {
        return when_qjs(fn(), function () {
          return do_qjs(fn).continue();
        });
      } else {
        return;
      }
    });
    return {continue: continue_qjs(result)};
  }
  return {do: once_qjs(do_qjs, 'You can only provide one body for a while expression.')};
}

module.exports.for = for_qjs;
function for_qjs(initial, conditionfn, stepfn) {
  if (typeof conditionfn !== 'function') throw new Error('The condition for a for expression must be wrapped in a function');
  if (typeof stepfn !== 'function') throw new Error('The step method for a for expression must be wrapped in a function');

  function do_qjs(fn) {
    return while_qjs(conditionfn).do(function do_qjs() {
      return when_qjs(fn(), stepfn);
    });
  }
  return {do: once_qjs(do_qjs, 'You can only provide one body for a for expression.')};
}

module.exports.switch = switch_qjs;
function switch_qjs(on) {
  var cases = [];
  var defaultCase = function () {};
  var result = Q.when(on, function next_qjs(on) {
    return Q.all(cases).then(function (cases) {
      for (var i = 0; i < cases.length; i++) {
        if (cases[i].val === on) {
          return cases[i].fn();
        }
      }
      return defaultCase();
    });
  });
  var cont = continue_qjs(result);
  function case_qjs(val, fn) {
    cases.push(when_qjs(val, function resolved_qjs(val) { return {val:val, fn:fn}; }));
    return returnable;
  }
  function default_qjs(fn) {
    defaultCase = fn;
    return {continue: cont};
  }

  var returnable = {continue: cont, case: case_qjs, default: once_qjs(default_qjs, 'You can only have one default case')};
  return returnable;
}


function when_qjs(promise, cb) {
  if (!cb) {
    return Q.resolve(promise);
  } else if (Q.isFulfilled(promise)) {
    var result = cb(Q.nearer(promise));
    return Q.resolve(result);
  } else  {
    return Q.when(promise, cb);
  }
}

function once_qjs(fn, message) {
  var called = false;
  return function once_qjs() {
    if (called) throw new Error(message || 'This function should only be called once');
    return fn.apply(this, arguments);
  };
}

module.exports.compile = require('./compile-qjs');