const ejs = require('ejs');
const fs = require('fs');

module.exports.failure = (jobs, author) => {
  const template = fs.readFileSync('resources/messages/failure.template.md.ejs', 'utf8');
  return ejs.render(template, {
    jobs,
    author,
  });
};

module.exports.success = (author) => {
  const template = fs.readFileSync('resources/messages/success.template.md.ejs', 'utf8');
  return ejs.render(template, {
    author,
  });
};
