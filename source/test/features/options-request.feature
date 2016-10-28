@core
Feature: ability to make OPTIONS request

    Scenario: should successfully send an OPTIONS call to target API and assert response
        When I request OPTIONS for /get
        Then response code should be 200
        And response header Access-Control-Allow-Credentials should be true
        And response header Access-Control-Allow-Methods should be GET, POST, PUT, DELETE, PATCH, OPTIONS
        And response header Allow should be HEAD, OPTIONS, GET
        And response header Content-Length should be 0
