const ejs = require('ejs');
const fs = require('fs');

module.exports.failure = (template, author, jobs) => {
  if (!template) template = 'default';
  const templateContents = fs.readFileSync(`resources/messages/failure/${template}.failure.template.md.ejs`, 'utf8');

  return ejs.render(templateContents, {
    jobs,
    author,
  });
};

module.exports.success = (template, author) => {
  if (!template) template = 'default';
  const templateContents = fs.readFileSync(`resources/messages/success/${template}.success.template.md.ejs`, 'utf8');

  return ejs.render(templateContents, {
    author,
  });
};
