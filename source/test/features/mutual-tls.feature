@core
Feature: 
    As an API Client
    I want to present a Client Certificate with a HTTP Request
    So that I can access protected systems

    Scenario: I successfully present a client certificate and ca certificate
        Given I use the mock target
        And I have valid client TLS configuration
        When I GET / 
        Then response code should be 200

