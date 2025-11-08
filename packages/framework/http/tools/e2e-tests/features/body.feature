@body
Feature: body decorator

The body decorator allows extracting the body from HTTP requests

  Background: Having a container
    Given a container

    Rule: body decorator allows extracting HTTP request no string body

      # Express 4 parses empty bodies as "{}" ¯\_(ツ)_/¯, so giving up testing it here
      Scenario: HTTP request no body is correctly extracted with body decorator without parameter name

        Given a warrior controller with string body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with no body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains empty body

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

    Rule: body decorator allows extracting HTTP request empty string body

      # Express 4 parses empty bodies as "{}" ¯\_(ツ)_/¯, so giving up testing it here
      Scenario: HTTP request empty body is correctly extracted with body decorator without parameter name

        Given a warrior controller with string body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with empty string body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains empty body

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

    Rule: body decorator allows extracting HTTP request string body

      Scenario: HTTP request string body is correctly extracted with body decorator without parameter name

        Given a warrior controller with string body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with string body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains string body

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "OPTIONS"|
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

    Rule: body decorator allows extracting HTTP request JSON body
      Scenario: HTTP request body is correctly extracted with body decorator without parameter name

        Given a warrior controller with body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with JSON body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct body data

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "OPTIONS"|
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

      Scenario: HTTP request body is correctly extracted with body decorator with parameter name

        Given a warrior controller with body decorator with parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with JSON body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct body data

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "OPTIONS"|
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

    Rule: body decorator allows extracting HTTP request URL-encoded body
      Scenario: HTTP request URL-encoded body is correctly extracted with body decorator without parameter name

        Given a warrior controller with urlencoded body decorator without parameter name for <method> method
        And a <server_kind> server from container
        And a <method> warriors HTTP request with urlencoded body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct body data

        Examples:
          | server_kind   | method   |
          | "express"     | "DELETE" |
          | "express"     | "OPTIONS"|
          | "express"     | "PATCH"  |
          | "express"     | "POST"   |
          | "express"     | "PUT"    |
          | "express4"    | "DELETE" |
          | "express4"    | "OPTIONS"|
          | "express4"    | "PATCH"  |
          | "express4"    | "POST"   |
          | "express4"    | "PUT"    |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |

    Rule: body decorator allows extracting HTTP request multipart/form-data body
      Scenario: HTTP request multipart/form-data body is correctly extracted with body decorator without parameter name

        Given a warrior controller with multipart body decorator without parameter name for <method> method for <server_kind> server
        And a <server_kind> server from container
        And a <method> warriors HTTP request with multipart body
        When the request is send
        Then the response status code is Ok-ish
        Then the response contains the correct multipart body data

        Examples:
          | server_kind   | method   |
          | "fastify"     | "DELETE" |
          | "fastify"     | "OPTIONS"|
          | "fastify"     | "PATCH"  |
          | "fastify"     | "POST"   |
          | "fastify"     | "PUT"    |
          | "hono"        | "DELETE" |
          | "hono"        | "OPTIONS"|
          | "hono"        | "PATCH"  |
          | "hono"        | "POST"   |
          | "hono"        | "PUT"    |
          | "uwebsockets" | "DELETE" |
          | "uwebsockets" | "OPTIONS"|
          | "uwebsockets" | "PATCH"  |
          | "uwebsockets" | "POST"   |
          | "uwebsockets" | "PUT"    |
