@core
Feature: ability to assert response headers and their values

    Scenario: Response header value assertions
        When I GET /xml
        Then response header Content-Type should be application/xml
        And response header Content-Type should be [a-z]/xml
        And response header Connection should not be boo
