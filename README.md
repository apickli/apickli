## aPickli

### What is apickli?

*Apickli* is an example Cucumber.js implementation dedicated for testing API platforms.

[Cucumber.js](https://github.com/cucumber/cucumber-js) is great JavaScript implementation of Behaviour Driven Development test framework - [Cucumber](http://cukes.info/)

Main goal of *Apickli* project is to make the building of funcional tests for APIs easy and less time consuming. Cucumber framework is using [Gherkin](http://cukes.info/gherkin.html) language for describing test scenarios in [BDD](http://en.wikipedia.org/wiki/Behavior-driven_development) way.  

*Apickli* has examples for supporting multiple HTTP request methods (verbs), detailed API response assertion and authentication / authorization.

### How to run this project?

To run examples, clone the *Apickli* to your local machine:
    
    $: git clone https://github.com/sauliuz/apick.li.git
    
Install all dependencies:

    $ npm install

Example API tests against *httpbin.org* can be run by directly (make sure you have [Cucumber.js](https://github.com/cucumber/cucumber-js) installed beforehand):

    $: cucumber.js features/httpbin-api.feature

Or, for more detailed reporting while running test cases *Apickli* has Grunt support:

    $: grunt tests
    
