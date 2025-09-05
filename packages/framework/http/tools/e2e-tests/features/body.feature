Feature: body decorator

The body decorator allows extracting the body from HTTP requests

  Background: Having a container
    Given a container

    Rule: body decorator allows extracting HTTP request body
      Scenario: HTTP request body is correctly extracted with body decorator without parameter name

        Given a warrior controller with body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct body data

        Examples:
          | server_kind | method   |
          | "express"   | "DELETE" |
          | "express"   | "OPTIONS"|
          | "express"   | "PATCH"  |
          | "express"   | "POST"   |
          | "express"   | "PUT"    |
          | "express4"  | "DELETE" |
          | "express4"  | "OPTIONS"|
          | "express4"  | "PATCH"  |
          | "express4"  | "POST"   |
          | "express4"  | "PUT"    |
          | "fastify"   | "DELETE" |
          | "fastify"   | "OPTIONS"|
          | "fastify"   | "PATCH"  |
          | "fastify"   | "POST"   |
          | "fastify"   | "PUT"    |
          | "hono"      | "DELETE" |
          | "hono"      | "OPTIONS"|
          | "hono"      | "PATCH"  |
          | "hono"      | "POST"   |
          | "hono"      | "PUT"    |

      Scenario: HTTP request body is correctly extracted with body decorator with parameter name

        Given a warrior controller with body decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct body data

        Examples:
          | server_kind | method   |
          | "express"   | "DELETE" |
          | "express"   | "OPTIONS"|
          | "express"   | "PATCH"  |
          | "express"   | "POST"   |
          | "express"   | "PUT"    |
          | "express4"  | "DELETE" |
          | "express4"  | "OPTIONS"|
          | "express4"  | "PATCH"  |
          | "express4"  | "POST"   |
          | "express4"  | "PUT"    |
          | "fastify"   | "DELETE" |
          | "fastify"   | "OPTIONS"|
          | "fastify"   | "PATCH"  |
          | "fastify"   | "POST"   |
          | "fastify"   | "PUT"    |
          | "hono"      | "DELETE" |
          | "hono"      | "OPTIONS"|
          | "hono"      | "PATCH"  |
          | "hono"      | "POST"   |
          | "hono"      | "PUT"    |
