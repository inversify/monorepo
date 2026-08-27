import { describe, expect, it } from 'vitest';

import { Container, type Inject, type Injectable } from '../../index.js';

describe('Issue 543', () => {
  it('Should throw correct circular dependency path', () => {
    class Irrelevant implements Injectable {}

    class Child2 implements Injectable {
      public circ: unknown;
      constructor(circ: Inject<Circular>) {
        this.circ = circ;
      }
    }

    class Child implements Injectable {
      public irrelevant: Irrelevant;
      public child2: Child2;
      constructor(
        irrelevant: Inject<Irrelevant>,
        child2: Inject<Child2>,
      ) {
        this.irrelevant = irrelevant;
        this.child2 = child2;
      }
    }

    class Circular implements Injectable {
      public irrelevant: Irrelevant;
      public child: Child;
      constructor(
        irrelevant: Inject<Irrelevant>,
        child: Inject<Child>,
      ) {
        this.irrelevant = irrelevant;
        this.child = child;
      }
    }

    class Root implements Injectable {
      public irrelevant: Irrelevant;
      public circ: Circular;
      constructor(
        irrelevant1: Inject<Irrelevant>,
        circ: Inject<Circular>,
      ) {
        this.irrelevant = irrelevant1;
        this.circ = circ;
      }
    }

    const container: Container = new Container();
    container.bind(Root).toSelf();
    container.bind(Irrelevant).toSelf();
    container.bind(Circular).toSelf();
    container.bind(Child).toSelf();
    container.bind(Child2).toSelf();

    function throws() {
      return container.get(Root);
    }

    expect(throws).toThrow(
      'Circular dependency found: Root -> Circular -> Child -> Child2 -> Circular',
    );
  });
});
