@core
Feature: ability to set request query parameters

    Scenario: checking values of query parameters passed in url in get request
        When I GET /get?argument1=1&argument2=test
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameter passed as datatable in get request
        Given I set query parameters to
            |parameter|value|
            |argument1|1|
            |argument2|test|
        When I GET /get
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameters passed in url in post request
        When I POST to /post?argument1=1&argument2=test
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameter passed as datatable in post request
        Given I set query parameters to
            |parameter|value|
            |argument1|1|
            |argument2|test|
        When I POST to /post
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameters passed in url in put request
        When I PUT /put?argument1=1&argument2=test
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameter passed as datatable in put request
        Given I set query parameters to
            |parameter|value|
            |argument1|1|
            |argument2|test|
        When I PUT /put
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameters passed in url in delete request
        When I DELETE /delete?argument1=1&argument2=test
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameter passed as datatable in delete request
        Given I set query parameters to
            |parameter|value|
            |argument1|1|
            |argument2|test|
        When I DELETE /delete
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameters passed in url in patch request
        When I PATCH /patch?argument1=1&argument2=test
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test

    Scenario: checking values of query parameter passed as datatable in patch request
        Given I set query parameters to
            |parameter|value|
            |argument1|1|
            |argument2|test|
        When I PATCH /patch
        Then response body path $.args.argument1 should be 1
        And response body path $.args.argument2 should be test
