/**
 * Turn statements which should be blocks into real blocks (e.g. after if statements)
 */

var needsBlock = {
    'IfStatement': ['consequent', 'alternate'],
    'while': ['body'], 
    'DoWhileStatement': ['body'],
    'WithStatement': ['body'],
    'ForStatement': ['body']
};
module.exports.transformNode = transformNode;
function transformNode(node) {
    if (needsBlock[node.type]) {
        needsBlock[node.type].forEach(function (child) {
            if (node[child] && node[child].type !== 'BlockStatement') {
                node[child].update('{' + node[child].source() + '}');
            }
        });
    }
}