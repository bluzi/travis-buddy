# TravisBuddy
> *TravisBuddy* is an awesome bot that will make life much easier for your contributoers.

### Please not that TravisBuddy is still under development. Please do not integrate it yet.

## Overview

*TravisBuddy* will comment on pull requests in your public repository everytime a test failed in one of them. 
The comment will include only the part of the build log that applies to your testing framework, 
so your contirbutors won't have to enter Travis's website and search the long and annoying build log for the reason the tests failed.

## Integration

*TravisBuddy* is super easy to integrate with! Just add the following lines to your `travis.yml`:
```yml
notifications:
  webhooks: http://54.157.44.69/mocha
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
  webhooks: http://54.157.44.69/mocha
  on_success: never
  on_failure: always
```

## Contribution

We're working on a documentation that will explain how to run, test and help build *TravisBuddy*, so hold tight. 
Meanwhile, feel free to help by improving this README.

## License

This project is licensed under the MIT License.
