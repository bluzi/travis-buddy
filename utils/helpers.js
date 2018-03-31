module.exports.replaceAll = (input, search, replacement) =>
  input.replace(new RegExp(search, 'g'), replacement);
