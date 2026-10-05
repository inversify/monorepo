@serve
Feature: serve

An adapter provides a gRPC server able to serve unary RPCs

  Background: Having a container
    Given a container

  Scenario: gRPC server is bootstrapped and handles a unary RPC
    Given a unary hero service for container
    And a grpc-js server from container
    When a GetHero request with id "hero-1" is sent
    Then the hero name is "hero-1"
