@query
Feature: query decorator

The query decorator allows extracting query parameters from URL

  Background: Having a container
    Given a container

    Rule: query decorator allows extracting URL query parameters
      Scenario: URL query parameters are correctly extracted with query decorator without parameter name

        Given a warrior controller with query decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with query parameters
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct URL query parameters

        Examples:
          | server_kind   | method     |
          | "express"     | "DELETE"   |
          | "express"     | "GET"      |
          | "express"     | "OPTIONS"  |
          | "express"     | "PATCH"    |
          | "express"     | "POST"     |
          | "express"     | "PUT"      |
          | "express4"    | "DELETE"   |
          | "express4"    | "GET"      |
          | "express4"    | "OPTIONS"  |
          | "express4"    | "PATCH"    |
          | "express4"    | "POST"     |
          | "express4"    | "PUT"      |
          | "fastify"     | "DELETE"   |
          | "fastify"     | "GET"      |
          | "fastify"     | "OPTIONS"  |
          | "fastify"     | "PATCH"    |
          | "fastify"     | "POST"     |
          | "fastify"     | "PUT"      |
          | "hono"        | "DELETE"   |
          | "hono"        | "GET"      |
          | "hono"        | "OPTIONS"  |
          | "hono"        | "PATCH"    |
          | "hono"        | "POST"     |
          | "hono"        | "PUT"      |
          | "uwebsockets" | "DELETE"   |
          | "uwebsockets" | "GET"      |
          | "uwebsockets" | "OPTIONS"  |
          | "uwebsockets" | "PATCH"    |
          | "uwebsockets" | "POST"     |
          | "uwebsockets" | "PUT"      |

      Scenario: URL query parameters are correctly extracted with query decorator with parameter name

        Given a warrior controller with query decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with query parameters
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct URL query parameters

        Examples:
          | server_kind   | method     |
          | "express"     | "DELETE"   |
          | "express"     | "GET"      |
          | "express"     | "OPTIONS"  |
          | "express"     | "PATCH"    |
          | "express"     | "POST"     |
          | "express"     | "PUT"      |
          | "express4"    | "DELETE"   |
          | "express4"    | "GET"      |
          | "express4"    | "OPTIONS"  |
          | "express4"    | "PATCH"    |
          | "express4"    | "POST"     |
          | "express4"    | "PUT"      |
          | "fastify"     | "DELETE"   |
          | "fastify"     | "GET"      |
          | "fastify"     | "OPTIONS"  |
          | "fastify"     | "PATCH"    |
          | "fastify"     | "POST"     |
          | "fastify"     | "PUT"      |
          | "hono"        | "DELETE"   |
          | "hono"        | "GET"      |
          | "hono"        | "OPTIONS"  |
          | "hono"        | "PATCH"    |
          | "hono"        | "POST"     |
          | "hono"        | "PUT"      |
          | "uwebsockets" | "DELETE"   |
          | "uwebsockets" | "GET"      |
          | "uwebsockets" | "OPTIONS"  |
          | "uwebsockets" | "PATCH"    |
          | "uwebsockets" | "POST"     |
          | "uwebsockets" | "PUT"      |
