## apickli - API integration testing framework

### What is apickli?

**Apickli** is Node.js package and REST API integration testing framework based on cucumber.js and  Gherkin.

[Cucumber.js](https://github.com/cucumber/cucumber-js) is JavaScript & Node.js implementation of Behaviour Driven Development test framework - [Cucumber](http://cukes.info/). Cucumber.js is using [Gherkin](http://cukes.info/gherkin.html) language for describing the test scenarios in [BDD](http://en.wikipedia.org/wiki/Behavior-driven_development) manner.  

The main goal of **Apickli** is to make the building of integration tests for APIs easy and less time consuming. **Apickli** is available as *npm* package via [Node Package Manager repositary](https://www.npmjs.com/package/apickli)


### How to start. Simple tutorial

**Apickli** depends on cucumber.js being installed on your system. You can do this by installing cucumber.js globaly:

    $: npm install -g cucumber

Your API end 2 end test project directory has to match the structure expected by Cucumber.js:

    end2endTests/
    ---- features/
    --------- httpbin.feature
    --------- step_definitions/
    -------------- httpbin.js
    ---- config.json
    
Specify apickli in your *config.json* update the project

    $ npm install

    
