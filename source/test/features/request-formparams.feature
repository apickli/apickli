@core
Feature: ability to set request form parameters

    Scenario: should successfully pipe form parameters
        Given I set Authorization header to Basic abcd
        And I pipe contents of file ./test/features/fixtures/formparams to body
        When I POST to /post
        Then response code should be 200
        And response body path $.data should be a=a&b=b&c=c
