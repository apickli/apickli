@core
Feature: ability to set scenario variables from response

    Scenario: setting header value as variable
        When I GET /get
        Then I store the value of response header Server as agent in scenario scope
        And value of scenario variable agent should be nginx

    Scenario: setting body path as variable (xml)
        When I GET /xml
        And I store the value of body path /slideshow/slide[2]/title as title in scenario scope
        Then value of scenario variable title should be Overview

    Scenario: setting body path as variable (json)
        Given I set User-Agent header to apickli
        When I GET /get
        And I store the value of body path $.headers.User-Agent as agent in scenario scope
        Then value of scenario variable agent should be apickli

    Scenario: checking values of scenario variables
        Then value of scenario variable title should be undefined
