@core
Feature: ability to set headers properly

    Scenario: Setting headers in GET request
        Given I set User-Agent header to apickli
        When I GET /get
        Then response body path $.headers.User-Agent should be apickli

    Scenario: checking values of headers passed as datatable in get request
        Given I set headers to
            |name|value|
            |User-Agent|apickli|
            |Accept|application/json|
        When I GET /get
        Then response body path $.headers.Accept should be application/json
        And response body path $.headers.User-Agent should be apickli

    Scenario: combine headers passed as table and Given syntax
        Given I set Custom-Header header to abcd
        And I set headers to
            |name|value|
            |User-Agent|apickli|
            |Accept|application/json|
        When I GET /get
        Then response body path $.headers.Accept should be application/json
        And response body path $.headers.User-Agent should be apickli
        And response body path $.headers.Custom-Header should be abcd

    Scenario: Same header field with multiple values
        Given I set Custom-Header header to A
        And I set Custom-Header header to B
        And I set headers to
            |name|value|
            |Custom-Header|C|
            |Custom-Header|D|
        When I GET /get
        Then response body path $.headers.Custom-Header should be A,B,C,D
