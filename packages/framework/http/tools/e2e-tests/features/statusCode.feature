@statusCode
Feature: statusCode decorator

The statusCode decorator allows set response status code

  Background: Having a container
    Given a container

    Rule: statusCode decorator allows set response status code
      Scenario: Response status code is correctly set

        Given a warrior controller with NO_CONTENT statusCode decorator for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with headers
        When the request is send
        Then the response status code is NO_CONTENT

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
          | "uwebsockets" | "DELETE"  |
          | "uwebsockets" | "GET"     |
          | "uwebsockets" | "OPTIONS" |
          | "uwebsockets" | "PATCH"   |
          | "uwebsockets" | "POST"    |
          | "uwebsockets" | "PUT"     |
