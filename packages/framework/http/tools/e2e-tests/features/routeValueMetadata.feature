@routeValueMetadata
Feature: routeValueMetadata

Route value metadata allows middleware to access metadata defined on controller methods via decorators

  Background: Having a container
    Given a container

  Rule: middleware can read route value metadata set by decorators

    Scenario: middleware reads route value metadata and sets response header

      Given a warrior controller with RouteValueMetadata for <method> method and <server_kind> server
      And a <server_kind> server from container
      And a <method> warriors HTTP request
      When the request is send
      Then the response status code is Ok-ish
      Then the response contains the route value metadata header

      Examples:
        | server_kind    | method    |
        | "express"      | "DELETE"  |
        | "express"      | "GET"     |
        | "express"      | "OPTIONS" |
        | "express"      | "PATCH"   |
        | "express"      | "POST"    |
        | "express"      | "PUT"     |
        | "express4"     | "DELETE"  |
        | "express4"     | "GET"     |
        | "express4"     | "OPTIONS" |
        | "express4"     | "PATCH"   |
        | "express4"     | "POST"    |
        | "express4"     | "PUT"     |
        | "fastify"      | "DELETE"  |
        | "fastify"      | "GET"     |
        | "fastify"      | "OPTIONS" |
        | "fastify"      | "PATCH"   |
        | "fastify"      | "POST"    |
        | "fastify"      | "PUT"     |
        | "hono"         | "DELETE"  |
        | "hono"         | "GET"     |
        | "hono"         | "OPTIONS" |
        | "hono"         | "PATCH"   |
        | "hono"         | "POST"    |
        | "hono"         | "PUT"     |
        | "uwebsockets"  | "DELETE"  |
        | "uwebsockets"  | "GET"     |
        | "uwebsockets"  | "OPTIONS" |
        | "uwebsockets"  | "PATCH"   |
        | "uwebsockets"  | "POST"    |
        | "uwebsockets"  | "PUT"     |
