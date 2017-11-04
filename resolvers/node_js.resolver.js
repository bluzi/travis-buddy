const helpers = require('../utils/helpers');
const markdownEscape = require('markdown-escape')

module.exports = (log, data) => {
    return new Promise((resolve, reject) => {
        let scriptLogs = [];
        scripts = (!data || !data.scripts) ? ['npm test'] : Array.isArray(data.scripts) ? data.scripts : [data.scripts];

        scripts.forEach(script => {
            let scriptContents = log.substr(log.indexOf(script));
            scriptContents = scriptContents.split('\n').slice(1).join('\n');
            scriptContents = scriptContents.substr(0, scriptContents.indexOf('The command')).trim();

            scriptContents = markdownEscape(scriptContents);

            scriptContents = helpers
                .replaceAll(scriptContents, '✓', '![alt text](https://raw.githubusercontent.com/bluzi/travis-buddy/master/resources/checkmark.png "Checkmark")');
            
            scriptLogs.push({
                command: script,
                contents: scriptContents,
            });
        });

        resolve({
            logs: scriptLogs
        });
    });
}