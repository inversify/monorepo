Feature: params decorator

The params decorator allows extracting parameters from URL

  Background: Having a container
    Given a container

    Rule: params decorator allows extracting URL parameters
      Scenario: URL parameters are correctly extracted with params decorator without parameter name

        Given a warrior controller with params decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with parameters
        When the request is send
        Then the response contains the correct URL parameters

        Examples:
          | server_kind | method   |
          | "express"   | "DELETE" |
          | "express"   | "GET"    |
          | "express"   | "PATCH"  |
          | "express"   | "POST"   |
          | "express"   | "PUT"    |
          | "fastify"   | "DELETE" |
          | "fastify"   | "GET"    |
          | "fastify"   | "PATCH"  |
          | "fastify"   | "POST"   |
          | "fastify"   | "PUT"    |

      Scenario: URL parameters are correctly extracted with params decorator with parameter name

        Given a warrior controller with params decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with parameters
        When the request is send
        Then the response contains the correct URL parameters

        Examples:
          | server_kind | method   |
          | "express"   | "DELETE" |
          | "express"   | "GET"    |
          | "express"   | "PATCH"  |
          | "express"   | "POST"   |
          | "express"   | "PUT"    |
          | "fastify"   | "DELETE" |
          | "fastify"   | "GET"    |
          | "fastify"   | "PATCH"  |
          | "fastify"   | "POST"   |
          | "fastify"   | "PUT"    |
