Feature: guard
The guard allows to continue or stop the request processing

  Background: Having a container
    Given a container

    Rule: guard allows to continue or stop the request processing
      Scenario: guard allows to continue request processing

        Given a warrior controller with SuccessfulGuard for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request
        When the request is send
        Then the response status code is Ok-ish

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

      Scenario: guard allows to stop request processing

        Given a warrior controller with UnsuccessfulGuard for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request
        When the request is send
        Then the response status code is FORBIDDEN

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
