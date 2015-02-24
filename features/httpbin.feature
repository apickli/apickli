Feature:
    Httpbin.org exposes various resources for HTTP request testing
    As Httpbin client I want to verify that all API resources are working as they should

    Scenario: Setting headers in GET request
        Given I set User-Agent header to apickli
        When I GET /get
		Then response body path $.headers.User-Agent should be apickli

	Scenario: Setting body payload in POST request
        Given I set body to {"key":"hello-world"}
        When I POST /post
        Then response body should contain hello-world

	Scenario: Sending request with basic auth authentication
		Given I have basic authentication credentials username and password
		When I POST /post
		Then response body should contain dXNlcm5hbWU6cGFzc3dvcmQ=

	Scenario: Parsing response xml body
		When I GET /xml
		Then response body path /slideshow/slide[1]/title should be Wake up to WonderWidgets!	

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
