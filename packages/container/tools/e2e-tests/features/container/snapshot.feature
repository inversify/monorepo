Feature: Snapshot

  A container can take and restore a snapshot to save the status of a container.

  Background: Having a container
    Given a container

  Rule: container saves and restores a snapshot

    Scenario: Container can save and restore state with snapshots
      Given a service "first-service" binding "first" to constant value
      And a service "second-service" binding "second" to constant value
      When "first" binding is bound to container
      And container takes a snapshot
      And "second" binding is bound to container
      And container restores the last snapshot
      Then the container has service "first-service" bound
      And the container does not have service "second-service" bound
      
    Scenario: Container can handle multiple snapshots
      Given a service "first-service" binding "first" to constant value
      And a service "second-service" binding "second" to constant value
      And a service "third-service" binding "third" to constant value
      When "first" binding is bound to container
      And container takes a snapshot
      And "second" binding is bound to container
      And container takes a snapshot
      And "third" binding is bound to container
      And container restores the last snapshot
      Then the container has service "first-service" bound
      And the container has service "second-service" bound
      And the container does not have service "third-service" bound
      When container restores the last snapshot
      Then the container has service "first-service" bound
      And the container does not have service "second-service" bound
      And the container does not have service "third-service" bound
