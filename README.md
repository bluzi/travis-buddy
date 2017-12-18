[![Build Status](https://travis-ci.org/bluzi/travis-buddy.svg?branch=master)](htts://travis-ci.org/bluzi/travis-buddy) 
![Heroku](https://heroku-badge.herokuapp.com/?app=travis-buddy-service&style=flat) 
<a href="https://www.statuscake.com" title="Website Uptime Monitoring"><img src="https://www.statuscake.com/App/button/index.php?Track=2MnfbAoOjQ&Days=1&Design=7" /></a>

<p align="center">
  <img width="450" src="https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/logo.png">
</p>

# TravisBuddy
> *TravisBuddy* is an awesome bot that will make life much easier for your contributoers.

## Overview
*TravisBuddy* will comment on pull requests in your public repository everytime a test failed in one of them. 
The comment will include only the part of the build log that applies to your testing framework, 
so your contirbutors won't have to enter Travis's website and search the long and annoying build log for the reason the tests failed.

![TravisBuddy example comment](https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/example.png)

## Repositories Using TravisBuddy
TravisBuddy is already being trusted by few repositories on GitHub. It automatically stars every project using it, [so you can easily see who's using it](https://github.com/TravisBuddy?tab=stars).

## Getting Started
### Public Repositories
If you're already using Travis CI, modify your `travis.yml` and add the following lines:
```yml
notifications:
    webhooks: https://www.travisbuddy.com/
```

If not, enable Travis CI in your repository by following the [tutorial in their website](https://docs.travis-ci.com/user/getting-started/) according to the tech you're using, and then add the code above to `travis.yml`.

Here's how your `travis.yml` should look like if yo're using `node_js`:
```yml
language: node_js
node_js:
    - "8"
notifications:
    webhooks: https://www.travisbuddy.com/
```

#### Disable success message
If you only want TravisBuddy to create comments when the tests fails, add `on_success: never` to the notifications node, like that:
```yml
notifications:
    webhooks: https://www.travisbuddy.com/
    on_success: never
```

### Private Repositories
TravisBuddy is not yet supported on private repositories. 
However, we're working on it, so stay alarmed.

### What if I still can't get it to work?
Feel free to [contact us using the website](https://www.travisbuddy.com/contact-us), or [leave an issue in our GitHub repository](https://github.com/bluzi/travis-buddy/issues).

## Run locally
To run a local instance of *TravisBuddy*, you'll need a github access token. You can get one by following [this link](https://github.com/settings/tokens), then press `Generate new token`, and hit the `Generate token` button.

Now, you can use one of these methods to run the project: 
Either make an enviorment variable called `githubAccessToken`, and set its value to your access token, and execute `bin/www`, like that:
```shell
export githubAccessToken=yourAccessToken
node bin/www
```
*Replace `yourAccessToken` with your access token



Or, execute `bin/www` with an argument, like that:
```shell
node bin/www githubAccessToken=yourAccessToken
```
*Replace `yourAccessToken` with your access token*

Now your server should be up and running.

To run the tests, you must create an enviorment varialbe called `githubAccessToken`, fill it wil your access token, then execute `npm test`.
Example:
```sh
export githubAccessToken=yourAccessToken
npm test
```
*Replace `yourAccessToken` with your access token*

Now you should be able to contribute. :)

## Test Repositories
The plan is to create a repository for each resolver (test library)
So far, we have:

- [Mocha](https://github.com/bluzi/travis-buddy-mocha-tests)
- [Jest](https://github.com/bluzi/travis-buddy-jest-tests)
- [Jasmine](https://github.com/bluzi/travis-buddy-jasmine-tests)

## Contribution
Feel free to create issues or solve some and create a pull request.
Follow the "Run locally" section of this documentation to learn how to debug the project. 

## License
This project is licensed under the MIT License.
