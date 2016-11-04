@core
Feature: ability to assert response payload

    Scenario: Parsing response xml body
        When I GET /xml
        Then response body path /slideshow/slide[1]/title should be Wake up to WonderWidgets!

    Scenario: Response body content type assertions (xml)
        When I GET /xml
        Then response body should be valid xml

    Scenario: Response body content type assertions (json)
        When I GET /get
        Then response body should be valid json

    Scenario: Response body text assertions
        When I GET /xml
        Then response body should contain WonderWidgets
        And response body should contain Wonder[Wdgist]
        And response body should not contain boo

    Scenario: Response body xpath assertions
        When I GET /xml
        Then response body path /slideshow/slide[2]/title should be [a-z]+
        And response body path /slideshow/slide[2]/title should not be \d+

    Scenario: Response body jsonpath assertions
        Given I set User-Agent header to apickli
        When I GET /get
        Then response body path $.headers.User-Agent should be [a-z]+
        And response body path $.headers.User-Agent should not be \d+

    Scenario: should differentiate between empty string and non-existing element in JSON path assertions
        When I GET /get
        Then response code should be 200
        And response body path $.origin should be [0-9\.]+
        And response body path $.notthere should be null

    Scenario: should successfully validate json using schema
        When I GET /get
        Then response body should be valid according to schema file ./test/features/fixtures/get-simple.schema

    Scenario: should successfully validate json array
        Given I set body to ["a","b","c"]
        When I POST to /post
        Then response body path $.json should be of type array
        And response body path $.json should be of type array with length 3

    Scenario: should successfully validate json object array
        Given I set body to [{"a":1},{"b":2},{"c":3}]
        When I POST to /post
        Then response body path $.json should be of type array
        And response body path $.json should be of type array with length 3
