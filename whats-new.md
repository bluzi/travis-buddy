## What's new?
### Insert Mode
@TravisBuddy now supports an insert mode called `update`, which means it will only comment once on each PR, and edit this single comment when something changes. 
Change the webhook URL in `.travis.yml` to: `https://www.travisbuddy.com/?insertMode=update` to enable this feature. 

Note that you probably want to remove `on_success: never` if it's set, so @TravisBuddy will be able to edit the comment when the build is successful.

### Interactions
You can now comment `@TravisBuddy stop` to tell @TravisBuddy to stop commenting on a PR.
While a comment with this contents is presented, @TravisBuddy will ignore the PR.

### Ignore similar logs from different jobs
In some repositories, each PR is being tested on multiple environments (for instance, multiple version of Node), so it can make @TravisBuddy's comment very long. We solved it by eliminating duplicate logs from different jobs - if a log is too similar to a another log, it's being ignored.

### Custom templates
You can now add a custom template for @TravisBuddy's comments by adding a file called `travis-buddy-failure-template.md` to the root of your repository. 
[Here you can find a sample template](https://raw.githubusercontent.com/bluzi/name-db/bluzi-travis-buddy-test/travis-buddy-failure-template.md), it follows the [mustache](https://github.com/janl/mustache.js/) syntax so you can [visit their docs](https://mustache.github.io/mustache.5.html) for further instructions.  

BTW, it also works with error and success comments, just add another template and call it `travis-buddy-success-template.md` and/or `travis-buddy-error-template.md`.

### Ignore succeeded test scripts
Some repositories execute more than one script in TravisCI. From now on, @TravisBuddy will only include in its comment build logs for scripts that failed. 

## Feedback
If you have any feedback, if @TravisBuddy is making you troubles, if you have an idea of how we can improve the service, please create an issue or contact me via eliran013@gmail.com.
 
<p align="center">
  <img src="https://raw.githubusercontent.com/bluzi/travis-buddy/master/public/images/header.jpg">
</p>
