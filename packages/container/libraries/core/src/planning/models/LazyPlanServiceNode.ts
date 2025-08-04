import { ServiceIdentifier } from '@inversifyjs/common';

import { PlanBindingNode } from './PlanBindingNode';
import { PlanServiceNode } from './PlanServiceNode';

const isLazyPlanServiceNodeSymbol: symbol = Symbol.for(
  '@inversifyjs/core/LazyPlanServiceNode',
);

export abstract class LazyPlanServiceNode implements PlanServiceNode {
  public [isLazyPlanServiceNodeSymbol]: true;
  protected readonly _serviceIdentifier: ServiceIdentifier;
  protected _serviceNode: PlanServiceNode | undefined;

  constructor(
    serviceNode: PlanServiceNode | undefined,
    serviceIdentifier: ServiceIdentifier,
  ) {
    this[isLazyPlanServiceNodeSymbol] = true;
    this._serviceNode = serviceNode;
    this._serviceIdentifier = serviceIdentifier;
  }

  public get bindings(): PlanBindingNode | PlanBindingNode[] | undefined {
    return this._getNode().bindings;
  }

  public get isContextFree(): boolean {
    return this._getNode().isContextFree;
  }

  public get serviceIdentifier(): ServiceIdentifier {
    return this._serviceIdentifier;
  }

  public set bindings(
    bindings: PlanBindingNode | PlanBindingNode[] | undefined,
  ) {
    this._getNode().bindings = bindings;
  }

  public set isContextFree(isContextFree: boolean) {
    this._getNode().isContextFree = isContextFree;
  }

  public static is(value: unknown): value is LazyPlanServiceNode {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<LazyPlanServiceNode>)[isLazyPlanServiceNodeSymbol] ===
        true
    );
  }

  public invalidate(): void {
    this._serviceNode = undefined;
  }

  public isExpanded(): boolean {
    return this._serviceNode !== undefined;
  }

  protected _getNode(): PlanServiceNode {
    if (this._serviceNode === undefined) {
      this._serviceNode = this._buildPlanServiceNode();
    }

    return this._serviceNode;
  }

  protected abstract _buildPlanServiceNode(): PlanServiceNode;
}
