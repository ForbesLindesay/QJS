/**
 * Add the line number for each line, so we can retrieve this information later in the event of an error.
 */


var templatesetc = require('../templates');
var template = templatesetc.templates;

module.exports.transformNode = transformNode;
function transformNode(node) {
    if (node.parent && (node.parent.type === 'BlockStatement' || node.parent.type === 'Program')) {
        node.update(template.addStackTrace({line:node.loc.start.line, src: node.source()}));
    }
}