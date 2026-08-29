import { describe, expect, it } from 'vitest';

import { Container, type Injectable } from '../../index.js';

describe('Issue 543', () => {
  it('Should throw correct circular dependency path', () => {
    class Irrelevant implements Injectable {}

    class Child2 implements Injectable {
      public circ: unknown;
      constructor(circ: Circular) {
        this.circ = circ;
      }
    }

    class Child implements Injectable {
      public irrelevant: Irrelevant;
      public child2: Child2;
      constructor(
        irrelevant: Irrelevant,
        child2: Child2,
      ) {
        this.irrelevant = irrelevant;
        this.child2 = child2;
      }
    }

    class Circular implements Injectable {
      public irrelevant: Irrelevant;
      public child: Child;
      constructor(
        irrelevant: Irrelevant,
        child: Child,
      ) {
        this.irrelevant = irrelevant;
        this.child = child;
      }
    }

    class Root implements Injectable {
      public irrelevant: Irrelevant;
      public circ: Circular;
      constructor(
        irrelevant1: Irrelevant,
        circ: Circular,
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
