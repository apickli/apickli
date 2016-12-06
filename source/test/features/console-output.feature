@console
Feature:
	Httpbin.org exposes various resources for HTTP request testing
	As Httpbin client I want to verify that all API resources are working as they should

	Scenario: Test output - response code should be (.*)
		Given I set User-Agent header to apickli
		When I GET /get
		Then response code should be 200
        
    Scenario: Test output - response code should be (.*)
		Given I set User-Agent header to apickli
		When I GET /xml
		Then response code should be 200
        
    Scenario: Test output - response header (.*) should exist
        Given I set User-Agent header to apickli
        When I GET /get
        Then response header Content-Type should exist
    
    Scenario: Test output - response header (.*) should not exist
        When I GET /get
        Then response header User-Agent should not exist
        
    Scenario: Test output - response header (.*) should be (.*)
        When I GET /get
        Then response header Content-Type should be application/json
        
    Scenario: Test output - response header (.*) should not be (.*)
        When I GET /get
        Then response header Content-Type should not be application/xml
        
    Scenario: Test output - response body path (.*) should be (.*)
        Given I set User-Agent header to apickli
        When I GET /get
        Then response body path $.url should be http://httpbin.org/get
            
    Scenario: Test output - response header (.*) should not be (.*)
        Given I set User-Agent header to cucumber
        When I GET /get
        Then response body path $.headers.User-Agent should not be apickli
        
    Scenario: Test output - response body should contain (.*)
        Given I set User-Agent header to apickli
        When I GET /get
        Then response body should contain url
        
    Scenario: Test output - response body should not contain (.*)
        Given I set User-Agent header to apickli
        When I GET /get
        Then response body should not contain apickli
    
    Scenario: Test output - response body should be valid (xml|json)
        When I GET /xml
        Then response body should be valid xml
        
    Scenario: Test output - response body should be valid (xml|json)
        When I GET /get
        Then response body should be valid json
        
    Scenario: should successfully validate json using schema
        When I GET /get
        Then response body should be valid according to schema file ./test/features/fixtures/get-simple.schema 

    Scenario: should successfully validate json array
        Given I set body to ["a","b","c"]
        When I POST to /post
        And response body path $.json should be of type array

    Scenario: should successfully validate json array length
        Given I set body to ["a","b","c"]
        When I POST to /post
        And response body path $.json should be of type array with length 3