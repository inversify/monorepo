import { container, inject, injectable, singleton } from 'tsyringe';

import { TsyringeBaseScenario } from './TsyringeBaseScenario.js';

@injectable()
@singleton()
class FinalNode {
  public log() {
    return 'log!';
  }
}

@injectable()
@singleton()
class Node10 {
  private readonly node1: FinalNode;
  private readonly node2: FinalNode;

  constructor(
    @inject(FinalNode) node1: FinalNode,
    @inject(FinalNode) node2: FinalNode,
  ) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node9 {
  private readonly node1: Node10;
  private readonly node2: Node10;

  constructor(@inject(Node10) node1: Node10, @inject(Node10) node2: Node10) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node8 {
  private readonly node1: Node9;
  private readonly node2: Node9;

  constructor(@inject(Node9) node1: Node9, @inject(Node9) node2: Node9) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node7 {
  private readonly node1: Node8;
  private readonly node2: Node8;

  constructor(@inject(Node8) node1: Node8, @inject(Node8) node2: Node8) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node6 {
  private readonly node1: Node7;
  private readonly node2: Node7;

  constructor(@inject(Node7) node1: Node7, @inject(Node7) node2: Node7) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node5 {
  private readonly node1: Node6;
  private readonly node2: Node6;

  constructor(@inject(Node6) node1: Node6, @inject(Node6) node2: Node6) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node4 {
  private readonly node1: Node5;
  private readonly node2: Node5;

  constructor(@inject(Node5) node1: Node5, @inject(Node5) node2: Node5) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node3 {
  private readonly node1: Node4;
  private readonly node2: Node4;

  constructor(@inject(Node4) node1: Node4, @inject(Node4) node2: Node4) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node2 {
  private readonly node1: Node3;
  private readonly node2: Node3;

  constructor(@inject(Node3) node1: Node3, @inject(Node3) node2: Node3) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
@singleton()
class Node1 {
  private readonly node1: Node2;
  private readonly node2: Node2;

  constructor(@inject(Node2) node1: Node2, @inject(Node2) node2: Node2) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class TsyringeGetComplexServiceInSingletonScope extends TsyringeBaseScenario {
  public async execute(): Promise<void> {
    container.resolve(Node1);
  }
}
