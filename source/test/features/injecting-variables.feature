@core
Feature:
	As Httpbin client I want to use variables in my feature files 

#test variable injection logic

	Scenario: using unknown variable in request path
		When I GET /get?foo=`UNKNOWN_VARIABLE`
        #replace unknown variables with empty string
        Then response body path $.args.foo should not be UNKNOWN_VARIABLE

	Scenario: using scenario variable
		Given I store the raw value bar as value1 in scenario scope
		When I GET /get?foo=`value1`
        Then response body path $.args.foo should be bar
   
#test injection logic with other step definitions   

    Scenario: Setting headers with variables
        Given I store the raw value apickli as foo in scenario scope
        And I set User-Agent header to `foo`
		When I GET /get
		Then response body path $.headers.User-Agent should be apickli
        
    Scenario: Calling a resource with variables
        Given I store the raw value /get as myResourcePath in scenario scope
		When I GET `myResourcePath`
		Then response body path $.url should be (.*)/get
        
    Scenario: Setting headers in datatable with variables
        Given I store the raw value apickli as foo in scenario scope
        And I store the raw value Accept as bar in scenario scope
		And I set headers to 
		|name|value|
		|User-Agent|`foo`|
		|`bar`|application/json|
		When I GET /get
		Then response body path $.headers.Accept should be application/json
		And response body path $.headers.User-Agent should be apickli
            
	Scenario: Setting body payload using variables
        Given I store the raw value {"key":"hello-world"} as myPayload in scenario scope  
		And I set body to `myPayload`
		When I POST to /post
		Then response body should contain hello-world

	Scenario: Setting body payload from file using variable
        Given I store the raw value ./test/features/fixtures/requestbody.xml as myFilePath in scenario scope
		And I pipe contents of file `myFilePath` to body
		When I POST to /post
		Then response body should contain "<a>b</a>"

	Scenario: Sending request with basic auth authentication using variables
        Given I store the raw value username as myUsername in scenario scope
        And I store the raw value password as myPassword in scenario scope
		Given I have basic authentication credentials `myUsername` and `myPassword`
		When I POST to /post
		Then response body path $.headers.Authorization should be Basic dXNlcm5hbWU6cGFzc3dvcmQ=
        
	Scenario: Response code checks
        Given I store the raw value 200 as myCode in scenario scope
        And I store the raw value 404 as myIncorrectCode in scenario scope
		When I GET /xml
		Then response code should be `myCode`
		And response code should not be `myIncorrectCode`

	Scenario: Response header value assertions
        Given I store the raw value Content-Type as myHeaderName in scenario scope
        And I store the raw value [a-z]/xml as myHeaderValue in scenario scope
        And I store the raw value boo as myHeaderIncorrectValue in scenario scope
		When I GET /xml
		Then response header `myHeaderName` should be application/xml
		And response header Content-Type should be `myHeaderValue`
		And response header Connection should not be `myHeaderIncorrectValue`

	Scenario: Response body text assertions
        Given I store the raw value WonderWidgets as correctValue in scenario scope
        And I store the raw value boo as incorrectValue in scenario scope
		When I GET /xml
		Then response body should contain `correctValue`
		And response body should not contain `incorrectValue`

	Scenario: Response body xpath assertions
        Given I store the raw value /slideshow/slide[2]/title as myPath in scenario scope
        Given I store the raw value [a-z]+ as correctValue in scenario scope
        And I store the raw value \d+ as incorrectValue in scenario scope
		When I GET /xml
		Then response body path `myPath` should be `correctValue`
		And response body path `myPath` should not be `incorrectValue`

	Scenario: Access token retrieval from response body (authorization code grant, password, client credentials)
        Given I store the raw value $.headers.Token as myTokenPath in scenario scope
		And I set Token header to token123
		When I GET /get
		Then I store the value of body path `myTokenPath` as access token
		Given I set bearer token
		When I GET /get
		Then response body path $.headers.Authorization should be Bearer token123
    
    Scenario: checking values of query parameter passed as datatable
        Given I store the raw value argument1 as myParam in scenario scope
        And I store the raw value test as myVal in scenario scope
		And I set query parameters to 
		|parameter|value|
		|argument1|`myParam`|
		|argument2|`myVal`|
		When I GET /get
		Then response body path $.args.argument1 should be 1
		And response body path $.args.argument2 should be test

    Scenario: should successfully validate json using schema
        Given I store the raw value ./test/features/fixtures/get-simple.schema as schemaPath in scenario scope
        When I GET /get
        Then response body should be valid according to schema file `schemaPath` 

    Scenario: should successfully validate json array
        Given I store the raw value 3 as myLength in scenario scope
    	And I set body to ["a","b","c"]
    	When I POST to /post
    	And response body path $.json should be of type array with length `myLength`
