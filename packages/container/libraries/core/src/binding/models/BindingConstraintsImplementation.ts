import { type ServiceIdentifier } from '@inversifyjs/common';

import { type SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList.js';
import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BindingConstraints } from './BindingConstraints.js';

export interface InternalBindingConstraints {
  getAncestorsCalled: boolean;
  readonly name: MetadataName | undefined;
  readonly tags: Map<MetadataTag, unknown>;
  readonly serviceIdentifier: ServiceIdentifier;
}

export class BindingConstraintsImplementation implements BindingConstraints {
  readonly #node: SingleImmutableLinkedListNode<InternalBindingConstraints>;

  constructor(node: SingleImmutableLinkedListNode<InternalBindingConstraints>) {
    this.#node = node;
  }

  public get name(): MetadataName | undefined {
    return this.#node.elem.name;
  }

  public get serviceIdentifier(): ServiceIdentifier {
    return this.#node.elem.serviceIdentifier;
  }

  public get tags(): Map<MetadataTag, unknown> {
    return this.#node.elem.tags;
  }

  public getAncestor(): BindingConstraints | undefined {
    this.#node.elem.getAncestorsCalled = true;

    if (this.#node.previous === undefined) {
      return undefined;
    }

    return new BindingConstraintsImplementation(this.#node.previous);
  }
}
