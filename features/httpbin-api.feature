Feature:
  Httpbin.org exposes various resources for HTTP request testing
  As Httpbin client I want to verify that API resources are working as they should

  Scenario: Get not existing resource path
    When I GET a doesnotexist/atall resource
    Then the http response status should be 404
    And  the response message should contain "Not Found"

  Scenario: Get existing resource path
    When I GET a html resource
    Then the http response status should be 200
    And the response message should contain "Moby"
    And the response header should have "access-control-allow-origin" element

