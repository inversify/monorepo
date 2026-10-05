@serve
Feature: serve

An adapter provides a gRPC server able to serve unary, client-streaming, server-streaming, and bidirectional RPCs

  Background: Having a grpc-js server
    Given a container
    And a hero service for container
    And a grpc-js server from container

  Scenario: gRPC server handles a unary RPC
    When a GetHero request with id "hero-1" is sent
    Then the hero name is "hero-1"

  Scenario: gRPC server handles a client-streaming RPC
    When an UploadHeroes request with names "a" and "b" is sent
    Then the uploaded hero names are "a" and "b"

  Scenario: gRPC server handles a server-streaming RPC
    When a ListHeroes request with id "hero-1" is sent
    Then the hero names are "hero-1-a" and "hero-1-b"

  Scenario: gRPC server handles a bidirectional RPC
    When a Chat request with messages "hi" and "there" is sent
    Then the chat messages are "hi" and "there"
