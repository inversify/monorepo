@params
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
        Then the response status code is Ok-ish
        Then the response contains the correct URL parameters

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "GET"    |
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "GET"    |
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "GET"    |
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "GET"    |
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |

      Scenario: URL parameters are correctly extracted with params decorator with parameter name

        Given a warrior controller with params decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with parameters
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct URL parameters

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "GET"    |
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "GET"    |
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "GET"    |
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "GET"    |
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "GET"    |
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |
