@core
Feature: ability to set body payload

    Scenario: Setting body payload in POST request
        Given I set body to {"key":"hello-world"}
        When I POST to /post
        Then response body should contain hello-world

    Scenario: Setting body payload in PUT request
        Given I set body to {"key":"hello-world"}
        When I PUT /put
        Then response body should contain hello-world

    Scenario: Setting body payload in DELETE request
        Given I set body to {"key":"hello-world"}
        When I DELETE /delete
        Then response body should contain hello-world

    Scenario: Setting body payload from file
        Given I pipe contents of file ./test/features/fixtures/requestbody.xml to body
        When I POST to /post
        Then response body should contain "<a>b</a>"
