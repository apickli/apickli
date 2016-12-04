@core
Feature:
	Httpbin.org exposes various resources for HTTP request testing
	As Httpbin client I want to verify that all API resources are working as they should

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

	Scenario: Setting body payload in POST request
		Given I set body to {"key":"hello-world"}
		When I POST to /post
		Then response body should contain hello-world

	Scenario: Setting body payload in PUT request
		Given I set body to {"key":"hello-world"}
		When I PUT /put
		Then response body should contain hello-world

	Scenario: Setting body payload in DELETE request
		Given I set body to {"key":"hello-world"}
		When I DELETE /delete
		Then response body should contain hello-world

	Scenario: Setting body payload from file
		Given I pipe contents of file ./test/features/fixtures/requestBody.xml to body
		When I POST to /post
		Then response body should contain "<a>b</a>"

	Scenario: Sending request with basic auth authentication
		Given I have basic authentication credentials username and password
		When I POST to /post
		Then response body path $.headers.Authorization should be Basic dXNlcm5hbWU6cGFzc3dvcmQ=

	Scenario: Parsing response xml body
		When I GET /xml
		Then response body path /slideshow/slide[1]/title should be Wake up to WonderWidgets!

	Scenario: Response body content type assertions (xml)
		When I GET /xml
		Then response body should be valid xml

	Scenario: Response body content type assertions (json)
		When I GET /get
		Then response body should be valid json

	Scenario: Checking headers in response
		When I GET /xml
		Then response header server should exist 
		And response header boo should not exist

	Scenario: Response code checks
		When I GET /xml
		Then response code should be 200
		And response code should not be 404

	Scenario: Response header value assertions
		When I GET /xml
		Then response header Content-Type should be application/xml
		And response header Content-Type should be [a-z]/xml
		And response header Connection should not be boo

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

	Scenario: Access token retrieval from response body (authorization code grant, password, client credentials)
		Given I set Token header to token123
		When I GET /get
		Then I store the value of body path $.headers.Token as access token

	Scenario: Using access token
		Given I set bearer token
		When I GET /get
		Then response body path $.headers.Authorization should be Bearer token123

	Scenario: Quota testing - first request
		Given I set X-Quota-Remaining header to 10
		When I GET /get
		Then I store the value of body path $.headers.X-Quota-Remaining as remaining1 in global scope

	Scenario: Quota testing - second request
		Given I set X-Quota-Remaining header to 9
		When I GET /get
		Then I store the value of body path $.headers.X-Quota-Remaining as remaining2 in global scope

	Scenario: Quota testing - assertion
		When I subtract remaining2 from remaining1
		Then result should be 1

	Scenario: setting header value as variable
		When I GET /get
		Then I store the value of response header Server as agent in scenario scope
		And value of scenario variable agent should be nginx

	Scenario: setting body path as variable (xml)
		When I GET /xml
		And I store the value of body path /slideshow/slide[2]/title as title in scenario scope
		Then value of scenario variable title should be Overview

	Scenario: setting body path as variable (json)
		Given I set User-Agent header to apickli
		When I GET /get
		And I store the value of body path $.headers.User-Agent as agent in scenario scope
		Then value of scenario variable agent should be apickli

	Scenario: checking values of scenario variables
		Then value of scenario variable title should be undefined

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

    Scenario: should successfully send an OPTIONS call to target API and assert response
        When I request OPTIONS for /get
        Then response code should be 200
        And response header Access-Control-Allow-Credentials should be true
        And response header Access-Control-Allow-Methods should be GET, POST, PUT, DELETE, PATCH, OPTIONS
        And response header Allow should be HEAD, OPTIONS, GET
        And response header Content-Length should be 0
        
    Scenario: should differentiate between empty string and non-existing element in JSON path assertions
        When I GET /get
        Then response code should be 200
        And response body path $.origin should be [0-9\.]+
        And response body path $.notthere should be undefined

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
