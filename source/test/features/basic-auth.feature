@core
Feature: basic authentication support

    Scenario: Sending request with basic auth authentication
        Given I have basic authentication credentials username and password
        When I POST to /post
        Then response body path $.headers.Authorization should be Basic dXNlcm5hbWU6cGFzc3dvcmQ=
