@core
Feature: ability to assert response code

    Scenario: Response code checks for 200
        When I GET /xml
        Then response code should be 200
        And response code should not be 404

    Scenario: Response code checks for 404
        When I GET /not-exist
        Then response code should be 404
        And response code should not be 200
