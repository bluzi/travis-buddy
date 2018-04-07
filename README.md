<p align="center">
  <img src="https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/header.jpg">
</p>

# TravisBuddy [![Build Status](https://travis-ci.org/bluzi/travis-buddy.svg?branch=master)](htts://travis-ci.org/bluzi/travis-buddy) ![Heroku](https://heroku-badge.herokuapp.com/?app=travis-buddy-service&style=flat) <a href="https://www.statuscake.com" title="Website Uptime Monitoring"><img src="https://www.statuscake.com/App/button/index.php?Track=2MnfbAoOjQ&Days=1&Design=7" /></a>

TravisBuddy is a cloud service that creates comments in failed pull requests and tell the author what went wrong and what they can do to fix it.

## Why should I use it?

* It takes 2 minutes to integrate TravisBuddy with your GitHub repository, assuming it's already integrated with TravisCI
* It will save precious time to you and to your contributors, as you won't have to explain what went wrong, and they won't have to go through the whole build log in TravisCI.
* It's free, open source and awesome.

![TravisBuddy example comment](https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/example.png)

## Repositories Using TravisBuddy

TravisBuddy is already being trusted by few repositories on GitHub. It automatically stars every project using it, [so you can easily see who's using it](https://github.com/TravisBuddy?tab=stars).

## Getting Started

### Public Repositories

If you're already using Travis CI, modify your `.travis.yml` and add the following lines:

```yml
notifications:
    webhooks: https://www.travisbuddy.com/
```

If not, enable Travis CI in your repository by following the [tutorial in their website](https://docs.travis-ci.com/user/getting-started/) according to the tech you're using, and then add the code above to `.travis.yml`.

Here's how your `.travis.yml` should look like if you're using `node_js`:

```yml
language: node_js
node_js:
    - "8"
notifications:
    webhooks: https://www.travisbuddy.com/
```

#### Custom Template

If TravisBuddy finds a file name `travis-buddy-failure-template.md` in the root of the branch it's commenting on, it'll be used as a template for the comments.

The content of the file must be a valid [mustache](https://github.com/janl/mustache.js/) template.
If you don't know the syntax, visit [the mustache documentation](https://mustache.github.io/mustache.5.html) or refer to this [sample template](https://raw.githubusercontent.com/bluzi/name-db/bluzi-travis-buddy-test/travis-buddy-failure-template.md).

#### Disable success message

If you only want TravisBuddy to create comments when the tests fails, add `on_success: never` to the notifications node, like this:

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

## Run Locally

It's easy to run a local instance of _TravisBuddy_ - just clone the repository, run `npm i` and use:

* `npm test` for tests
* `npm start` to run

## Test Repositories

The plan is to create a repository for each resolver (test library)
So far, we have:

* [Mocha](https://github.com/bluzi/travis-buddy-mocha-tests)
* [Jest](https://github.com/bluzi/travis-buddy-jest-tests)
* [Jasmine](https://github.com/bluzi/travis-buddy-jasmine-tests)

## Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Contribution

Feel free to create issues or create pull requests.
Follow the "Run locally" section of this documentation to learn how to debug the project.

Note that there are [open issues](https://github.com/bluzi/travis-buddy/issues) with detailed instruction on how to resolve them, so if you want to help - just pick one labeled `good first issue`.

## License

This project is licensed under the MIT License.

<p align="center">
  <img width="420" src="https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/logo.png">
</p>
