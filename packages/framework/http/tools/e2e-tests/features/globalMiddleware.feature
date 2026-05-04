@globalMiddleware
Feature: global middleware

Global pre-handler middlewares run for every request at the application level,
regardless of route matching.

  Background: Having a container
    Given a container

  Rule: global pre-handler middleware runs for unmatched routes

    Scenario: global pre-handler middleware sets X-Global header on unmatched route
      Given a "GET" warrior controller for container
      And a global header middleware registered for <server_kind> server
      And a <server_kind> server from container
      And a GET not-a-route HTTP request
      When the request is send
      Then the response status code is NOT_FOUND
      Then the response contains the X-Global header

      Examples:
        | server_kind   |
        | "express"     |
        | "express4"    |
        | "fastify"     |
        | "hono"        |
        | "uwebsockets" |

  Rule: global CORS pre-handler middleware intercepts OPTIONS preflight for single-verb routes

    Scenario: CORS middleware handles OPTIONS preflight for GET-only route
      Given a GET test-cors warrior controller for container
      And a global CORS middleware registered for <server_kind> server
      And a <server_kind> server from container
      And an OPTIONS test-cors HTTP request
      When the request is send
      Then the response status code is NO_CONTENT
      Then the response contains the Access-Control-Allow-Origin header

      Examples:
        | server_kind |
        | "express"   |
        | "express4"  |
        | "fastify"   |
        | "hono"      |
