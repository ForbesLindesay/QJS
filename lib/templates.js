/**
 * template.js loads the templates and constants from templatesandconstants.js
 */

var filename = './templatesandconstants.js';
var secretPrefix = module.exports.secretPrefix = '_qjsgeneratedcode_';

var fs = require('fs');

var templates = module.exports.templates = {};
var constants = module.exports.constants = {};

function buildTemplate(name, contents) {
    return function template(values) {
        var errs = [];
        var result = contents.replace(/\{\{(\w*)\}\}/g, function (_, name) {
            if (typeof values[name] !== 'undefined') {
                return values[name];
            } else {
                errs.push(name);
                return name;
                throw new Error('You must provide a value for ' + name);
            }
        });
        if (errs.length) throw new Error('You must provide values for the following in ' + name + ': ' + errs.join (', '));
        return result.trim();
    };
}
var file = fs.readFileSync(filename).toString();
file = file.replace(/^\/\/[^\n]*$/gm, '');
var regex = /^\`\`\`([\w\.]*)$([^\`]*)/gm;
var parsed;
var contents;
while(parsed = regex.exec(file)) {
    contents = parsed[2].trim().replace(/\{\{prefix\}\}/g, secretPrefix);
    if (contents.charAt(0) === '"' && contents.charAt(contents.length - 1) === '"'){
        contents = contents.substr(1, contents.length - 2);
        set(constants, parsed[1], contents);
    } else {
        set(templates, parsed[1], buildTemplate(parsed[1], contents));
    }
}

function set(on, name, value) {
    name = name.split(/\./g);
    var namePart = name.shift(1);
    while (name.length) {
        on[namePart] = on[namePart] || {};
        on = on[namePart];
        namePart = name.shift(1);
    }
    on[namePart] = value;
}