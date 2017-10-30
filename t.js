const GitHub = require('github-api');
const Travis = require('travis-ci');
const request = require('request');

const owner = 'bluzi';
const repo = 'name-db';
const prNumber = 223; //294625581
const githubAccessToken = '2b7e047aac678ae22d7c2be04887ef1038e2c055';


request('https://api.travis-ci.org/builds/294943584', {}, (e, r, d) => {
    d = JSON.parse(d);
    const jobId = d.matrix[0].id;    
    request(`https://api.travis-ci.org/jobs/${jobId}/log`, {
        headers: {
            Accept: 'text/plain'
        }
    }, (e, r, d) => {
        debugger;
    })
})



// const travis = new Travis({
//     version: '2.0.0'
// });

// travis.authenticate({
//     access_token: 'JhIEGUes1OAz1RJRiVJIJg'
// }, function (err) {
//     if (err) return console.error('Could not autenticate', err);

//     console.log(arguments);
//     travis.repos(owner, repo).builds(294633881).get((err, build) => {
//         debugger;
//         travis.jobs(build.jobs[0].id.toString()).get((err, job) => {
//             debugger;
//             travis.logs(594).get((err, log) => {
//                 debugger;
//             });
//         });
//     });
// });


const gh = new GitHub({
    token: githubAccessToken
});

(async () => {

    const issues = await gh.getIssues(owner, repo);
    //const result = await issues.createIssueComment(prNumber, 'Hi!');
})();