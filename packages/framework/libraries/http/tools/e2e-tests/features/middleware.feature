Feature: middleware
The m allows to continue or stop the request processing

  Background: Having a container
    Given a container

  Rule: middleware allows to continue or stop the request processing

    Scenario: middleware allows to continue request processing
      Given a warrior controller with SuccessfulMiddleware for <method> method and <server_kind> server
      And a <server_kind> server from container
      And a <method> warriors HTTP request
      When the request is send
      Then the response status code is Ok-ish
      Then the response contains the correct header

      Examples:
        | server_kind | method    |
        | "express"   | "DELETE"  |
        | "express"   | "GET"     |
        | "express"   | "OPTIONS" |
        | "express"   | "PATCH"   |
        | "express"   | "POST"    |
        | "express"   | "PUT"     |
        | "express4"  | "DELETE"  |
        | "express4"  | "GET"     |
        | "express4"  | "OPTIONS" |
        | "express4"  | "PATCH"   |
        | "express4"  | "POST"    |
        | "express4"  | "PUT"     |
        | "fastify"   | "DELETE"  |
        | "fastify"   | "GET"     |
        | "fastify"   | "OPTIONS" |
        | "fastify"   | "PATCH"   |
        | "fastify"   | "POST"    |
        | "fastify"   | "PUT"     |
        | "hono"      | "DELETE"  |
        | "hono"      | "GET"     |
        | "hono"      | "OPTIONS" |
        | "hono"      | "PATCH"   |
        | "hono"      | "POST"    |
        | "hono"      | "PUT"     |

    Scenario: middleware allows to stop request processing
      Given a warrior controller with UnsuccessfulMiddleware for <method> method and <server_kind> server
      And a <server_kind> server from container
      And a <method> warriors HTTP request
      When the request is send
      Then the response status code is FORBIDDEN
      Then the response contains the correct header

      Examples:
        | server_kind | method    |
        | "express"   | "DELETE"  |
        | "express"   | "GET"     |
        | "express"   | "OPTIONS" |
        | "express"   | "PATCH"   |
        | "express"   | "POST"    |
        | "express"   | "PUT"     |
        | "express4"  | "DELETE"  |
        | "express4"  | "GET"     |
        | "express4"  | "OPTIONS" |
        | "express4"  | "PATCH"   |
        | "express4"  | "POST"    |
        | "express4"  | "PUT"     |
        | "fastify"   | "DELETE"  |
        | "fastify"   | "GET"     |
        | "fastify"   | "OPTIONS" |
        | "fastify"   | "PATCH"   |
        | "fastify"   | "POST"    |
        | "fastify"   | "PUT"     |
        | "hono"      | "DELETE"  |
        | "hono"      | "GET"     |
        | "hono"      | "OPTIONS" |
        | "hono"      | "PATCH"   |
        | "hono"      | "POST"    |
        | "hono"      | "PUT"     |
