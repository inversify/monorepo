@httpResponse
Feature: controller route HttpResponse return values

The setHeader decorator allows set response headers

  Background: Having a container
    Given a container

    Rule: setHeader decorator allows set response headers with custom status codes
      Scenario: HTTP headers are correctly set with custom status codes

        Given a warrior controller with route returning HttpResponse object for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with headers
        When the request is send
        Then the response status code is NO_CONTENT
        Then the response contains the correct header

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
