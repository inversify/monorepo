Feature: requestParam

An adapter provides a proper server able to serve HTTP services using different HTTP methods with params

  Background: Having a container
    Given a container

    Rule: adapter provides an HTTP server that handles valid HTTP requests
      Scenario: HTTP server is bootstraped and correctly handles a valid HTTP requests

        Given a <method> warrior controller with param id for container
        And a <server_kind> server from container
        And a <method> warriors with param <param_id> HTTP request
        When the request is send
        Then the response status code is Ok-ish

        Examples:
          | server_kind | method   | param_id    |
          | "express"   | "DELETE" | "id-example"|
          | "express"   | "GET"    | "id-example"|
          | "express"   | "OPTIONS"| "id-example"|
          | "express"   | "PATCH"  | "id-example"|
          | "express"   | "POST"   | "id-example"|
          | "express"   | "PUT"    | "id-example"|
