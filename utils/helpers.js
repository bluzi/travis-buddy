module.exports.replaceAll = function(input, search, replacement) {
    var target = input;
    return target.replace(new RegExp(search, 'g'), replacement);
};