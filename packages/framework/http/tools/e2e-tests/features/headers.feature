@headers
Feature: headers decorator

The headers decorator allows extracting headers from the HTTP request

  Background: Having a container
    Given a container

    Rule: headers decorator allows extracting HTTP headers
      Scenario: HTTP headers are correctly extracted with headers decorator without parameter name

        Given a warrior controller with headers decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with headers
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct headers information

        Examples:
          | server_kind   | method    |
          | "express"     | "DELETE"  |
          | "express"     | "GET"     |
          | "express"     | "OPTIONS" |
          | "express"     | "PATCH"   |
          | "express"     | "POST"    |
          | "express"     | "PUT"     |
          | "express4"    | "DELETE"  |
          | "express4"    | "GET"     |
          | "express4"    | "OPTIONS" |
          | "express4"    | "PATCH"   |
          | "express4"    | "POST"    |
          | "express4"    | "PUT"     |
          | "fastify"     | "DELETE"  |
          | "fastify"     | "GET"     |
          | "fastify"     | "OPTIONS" |
          | "fastify"     | "PATCH"   |
          | "fastify"     | "POST"    |
          | "fastify"     | "PUT"     |
          | "hono"        | "DELETE"  |
          | "hono"        | "GET"     |
          | "hono"        | "OPTIONS" |
          | "hono"        | "PATCH"   |
          | "hono"        | "POST"    |
          | "hono"        | "PUT"     |
          | "uwebsockets" | "DELETE"   |
          | "uwebsockets" | "GET"      |
          | "uwebsockets" | "OPTIONS"  |
          | "uwebsockets" | "PATCH"    |
          | "uwebsockets" | "POST"     |
          | "uwebsockets" | "PUT"      |

      Scenario: HTTP headers are correctly extracted with headers decorator with parameter name

        Given a warrior controller with headers decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with headers
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct headers information

        Examples:
          | server_kind   | method    |
          | "express"     | "DELETE"  |
          | "express"     | "GET"     |
          | "express"     | "OPTIONS" |
          | "express"     | "PATCH"   |
          | "express"     | "POST"    |
          | "express"     | "PUT"     |
          | "express4"    | "DELETE"  |
          | "express4"    | "GET"     |
          | "express4"    | "OPTIONS" |
          | "express4"    | "PATCH"   |
          | "express4"    | "POST"    |
          | "express4"    | "PUT"     |
          | "fastify"     | "DELETE"  |
          | "fastify"     | "GET"     |
          | "fastify"     | "OPTIONS" |
          | "fastify"     | "PATCH"   |
          | "fastify"     | "POST"    |
          | "fastify"     | "PUT"     |
          | "hono"        | "DELETE"  |
          | "hono"        | "GET"     |
          | "hono"        | "OPTIONS" |
          | "hono"        | "PATCH"   |
          | "hono"        | "POST"    |
          | "hono"        | "PUT"     |
          | "uwebsockets" | "DELETE"   |
          | "uwebsockets" | "GET"      |
          | "uwebsockets" | "OPTIONS"  |
          | "uwebsockets" | "PATCH"    |
          | "uwebsockets" | "POST"     |
          | "uwebsockets" | "PUT"      |
