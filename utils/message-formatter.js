const ejs = require('ejs');
const fs = require('fs');

module.exports.failure = (template, author, jobs) => {
  const templateContents = fs.readFileSync(`resources/messages/failure/${template || 'default'}.failure.template.md.ejs`, 'utf8');

  return ejs.render(templateContents, {
    jobs,
    author,
  });
};

module.exports.success = (template, author) => {
  const templateContents = fs.readFileSync(`resources/messages/success/${template || 'default'}.success.template.md.ejs`, 'utf8');

  return ejs.render(templateContents, {
    author,
  });
};
