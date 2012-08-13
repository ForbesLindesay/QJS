var id = 0;
module.exports.promise = promise;
function promise() {
    var result = { type: 'promise' };
    result.resolve = function resolve(value) {
        result.value = value;
    };
    return result;
}
module.exports.join = join;
function join(array, separator) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].type === 'promise') {
            if (typeof array[i].value !== 'string') {
                throw new Error(errors.unresolvedJoin);
            }
            array[i] = array[i].value;
        }
    }
    return array.join(separator || '');
}