import { injectable } from '@inversifyjs/core';

import { Platform } from '../models/Platform.js';
import { InversifyCurrentBaseScenario } from './InversifyCurrentBaseScenario.js';

@injectable()
class FinalNode {
  public log() {
    return 'log!';
  }
}

@injectable()
class Node10 {
  private readonly node1: FinalNode;
  private readonly node2: FinalNode;

  constructor(node1: FinalNode, node2: FinalNode) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node9 {
  private readonly node1: Node10;
  private readonly node2: Node10;

  constructor(node1: Node10, node2: Node10) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node8 {
  private readonly node1: Node9;
  private readonly node2: Node9;

  constructor(node1: Node9, node2: Node9) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node7 {
  private readonly node1: Node8;
  private readonly node2: Node8;

  constructor(node1: Node8, node2: Node8) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node6 {
  private readonly node1: Node7;
  private readonly node2: Node7;

  constructor(node1: Node7, node2: Node7) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node5 {
  private readonly node1: Node6;
  private readonly node2: Node6;

  constructor(node1: Node6, node2: Node6) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node4 {
  private readonly node1: Node5;
  private readonly node2: Node5;

  constructor(node1: Node5, node2: Node5) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node3 {
  private readonly node1: Node4;
  private readonly node2: Node4;

  constructor(node1: Node4, node2: Node4) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node2 {
  private readonly node1: Node3;
  private readonly node2: Node3;

  constructor(node1: Node3, node2: Node3) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node1 {
  private readonly node1: Node2;
  private readonly node2: Node2;

  constructor(node1: Node2, node2: Node2) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class InversifyCurrentGetComplexResolvedValueServiceInTransientScope extends InversifyCurrentBaseScenario {
  constructor() {
    super(`${Platform.inversifyCurrent} (Resolved Value)`);
  }

  public override async setUp(): Promise<void> {
    this._container
      .bind(FinalNode)
      .toResolvedValue(() => new FinalNode())
      .inTransientScope();
    this._container
      .bind(Node1)
      .toResolvedValue(
        (firstNode: Node2, secondNode: Node2) =>
          new Node1(firstNode, secondNode),
        [Node2, Node2],
      )
      .inTransientScope();
    this._container
      .bind(Node2)
      .toResolvedValue(
        (firstNode: Node3, secondNode: Node3) =>
          new Node2(firstNode, secondNode),
        [Node3, Node3],
      )
      .inTransientScope();
    this._container
      .bind(Node3)
      .toResolvedValue(
        (firstNode: Node4, secondNode: Node4) =>
          new Node3(firstNode, secondNode),
        [Node4, Node4],
      )
      .inTransientScope();
    this._container
      .bind(Node4)
      .toResolvedValue(
        (firstNode: Node5, secondNode: Node5) =>
          new Node4(firstNode, secondNode),
        [Node5, Node5],
      )
      .inTransientScope();
    this._container
      .bind(Node5)
      .toResolvedValue(
        (firstNode: Node6, secondNode: Node6) =>
          new Node5(firstNode, secondNode),
        [Node6, Node6],
      )
      .inTransientScope();
    this._container
      .bind(Node6)
      .toResolvedValue(
        (firstNode: Node7, secondNode: Node7) =>
          new Node6(firstNode, secondNode),
        [Node7, Node7],
      )
      .inTransientScope();
    this._container
      .bind(Node7)
      .toResolvedValue(
        (firstNode: Node8, secondNode: Node8) =>
          new Node7(firstNode, secondNode),
        [Node8, Node8],
      )
      .inTransientScope();
    this._container
      .bind(Node8)
      .toResolvedValue(
        (firstNode: Node9, secondNode: Node9) =>
          new Node8(firstNode, secondNode),
        [Node9, Node9],
      )
      .inTransientScope();
    this._container
      .bind(Node9)
      .toResolvedValue(
        (firstNode: Node10, secondNode: Node10) =>
          new Node9(firstNode, secondNode),
        [Node10, Node10],
      )
      .inTransientScope();
    this._container
      .bind(Node10)
      .toResolvedValue(
        (firstNode: FinalNode, secondNode: FinalNode) =>
          new Node10(firstNode, secondNode),
        [FinalNode, FinalNode],
      )
      .inTransientScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Node1);
  }

  public override async tearDown(): Promise<void> {
    await this._container.unbindAllAsync();
  }
}
