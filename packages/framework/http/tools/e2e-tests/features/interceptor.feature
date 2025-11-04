@interceptor
Feature: interceptor

Interceptors allow intercepting the request lifecycle before and after the handler execution

  Background: Having a container
    Given a container

  Rule: interceptor allows to intercept request lifecycle

    Scenario: interceptor allows to modify response headers and status
      Given a warrior controller with WarriorRouteInterceptor for <method> method and <server_kind> server
      And a <server_kind> server from container
      And a <method> warriors HTTP request
      When the request is send
      Then the response status code is ACCEPTED
      Then the response contains the correct interceptor header

      Examples:
        | server_kind   | method    |
        | "express"     | "DELETE"  |
        | "express"     | "GET"     |
        | "express"     | "PATCH"   |
        | "express"     | "POST"    |
        | "express"     | "PUT"     |
        | "express4"    | "DELETE"  |
        | "express4"    | "GET"     |
        | "express4"    | "PATCH"   |
        | "express4"    | "POST"    |
        | "express4"    | "PUT"     |
        | "fastify"     | "DELETE"  |
        | "fastify"     | "GET"     |
        | "fastify"     | "PATCH"   |
        | "fastify"     | "POST"    |
        | "fastify"     | "PUT"     |
        | "hono"        | "DELETE"  |
        | "hono"        | "GET"     |
        | "hono"        | "PATCH"   |
        | "hono"        | "POST"    |
        | "hono"        | "PUT"     |
        | "uwebsockets" | "DELETE"  |
        | "uwebsockets" | "GET"     |
        | "uwebsockets" | "PATCH"   |
        | "uwebsockets" | "POST"    |
        | "uwebsockets" | "PUT"     |
