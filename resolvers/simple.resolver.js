const helpers = require('../utils/helpers');
const markdownEscape = require('markdown-escape');
const defaultScripts = require('../resources/default-scripts.json');

module.exports = (log, data) => {
    return new Promise((resolve, reject) => {
        let scriptLogs = [];
        let scripts;

        if (!data.scripts) {
            if (!defaultScripts[data.language]) {
                return reject(`Deafult script was not found for '${data.language}'`);
            }

            scripts = [defaultScripts[data.language]];
        } else {
            if (Array.isArray(data.scripts)) {
                scripts = data.scripts;
            } else {
                scripts = [data.scripts];
            }
        }

        scripts.forEach(script => {
            let scriptContents = log.substr(log.indexOf(script));
            scriptContents = scriptContents.split('\n').slice(1).join('\n');
            scriptContents = scriptContents.substr(0, scriptContents.indexOf('" exited with ')).trim();
            scriptContents = scriptContents.split('\n').slice(0, -1).join('\n');

            scriptLogs.push({
                command: script,
                contents: scriptContents,
            });
        });

        resolve({
            scripts: scriptLogs
        });
    });
}