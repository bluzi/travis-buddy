[![Build Status](https://travis-ci.org/bluzi/travis-buddy.svg?branch=master)](https://travis-ci.org/bluzi/name-db)

# TravisBuddy
> *TravisBuddy* is an awesome bot that will make life much easier for your contributoers.

### Please not that TravisBuddy is still under development. Please do not integrate it yet. (However, we're getting there, no worries)

## Overview
*TravisBuddy* will comment on pull requests in your public repository everytime a test failed in one of them. 
The comment will include only the part of the build log that applies to your testing framework, 
so your contirbutors won't have to enter Travis's website and search the long and annoying build log for the reason the tests failed.

![TravisBuddy example comment](https://user-images.githubusercontent.com/13808883/32201227-75bec3b4-bdde-11e7-92d6-f58c51e0945a.png)


## Integration
*TravisBuddy* is super easy to integrate with! Just add the following lines to your `travis.yml`:
```yml
notifications:
  webhooks: http://54.157.44.69
  on_success: never  
  on_failure: always
```

That's it! now, once a test will fail in a pull request in your repository, *TravisBuddy* will announce it and make it easy for the contributor to fix the error ASAP.

Here's an example of a complete `travis.yml`:
```yml
language: node_js   
node_js:
  - "8"
notifications:
  webhooks: http://54.157.44.69
  on_success: never
  on_failure: always
```

## Run locally
To run a local instance of *TravisBuddy*, you'll need a github access token. You can get one by following [this link](https://github.com/settings/tokens), then press `Generate new token`, and hit the `Generate token` button.

Now, you can use one of these methods to run the project: 
Either make an enviorment variable called `githubAccessToken`, and set its value to your access token, and execute `bin/www`, like that:
```shell
export githubAccessToken=yourAccessToken
node bin/www
```
*Replace `yourAccessToken` with your access token in both methods*

Or, execute `bin/www` with an argument, like that:
```shell
node bin/www githubAccessToken=yourAccessToken
```
*Replace `yourAccessToken` with your access token in both methods*

Now your server should be up and running.

To run the tests, you must create an enviorment varialbe called `githubAccessToken`, fill it wil your access token, then execute `npm test`.
Example:
```sh
export githubAccessToken=yourAccessToken
npm test
```
*Replace `yourAccessToken` with your access token in both methods*

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
