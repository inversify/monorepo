@serve
Feature: serve

An adapter provides a proper server able to serve HTTP services using different HTTP methods

  Background: Having a container
    Given a container

    Rule: adapter provides an HTTP server that handles valid HTTP requests
      Scenario: HTTP server is bootstraped and correctly handles a valid HTTP requests

        Given a <method> warrior controller for container
        And a <server_kind> server from container
        And a <method> warriors HTTP request
        When the request is send
        Then the response status code is Ok-ish

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "GET"    |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "GET"    |
          | "express4"    | "OPTIONS"|
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "GET"    |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "GET"    |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "GET"    |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |
