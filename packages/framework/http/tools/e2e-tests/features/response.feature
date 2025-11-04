@response
Feature: response decorator

The response decorator allows send body json

  Background: Having a container
    Given a container

    Rule: response decorator allows send body json
      Scenario: JSON body is correctly sent with response decorator

        Given a warrior controller with response decorator for <method> method and <server_kind> server
        And a <server_kind> server from container
        And a <method> warriors HTTP request
        When the request is send
        Then the response status code is Ok-ish

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
