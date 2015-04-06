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
    
Features directory contains Cucumber feature files written in Gherkin. Step_definitions contains the JavaScript implementation of Gherkin test cases. Check out the GitHub repository for example implementations covering most used scenarions in API end 2 end testing cases.

Update the project dependencies:

    $ npm install
    
The following will run all the Cucumber.js test cases (in the project directory)

    $ cucumber.js features/httpbin.feature
    
Or you can use task runner like **Grunt.js** to run the tests. Check the [Apickli example on GitHub](https://github.com/apickli/apickli/blob/master/Gruntfile.js) for Grunt configuration: 

    $ grunt tests
        
### Contributing

If you have any comments or suggestions, feel free to raise [Issues on GitHub](https://github.com/apickli/apickli/issues) or fork the project and issue a pull request with suggested improvements.

