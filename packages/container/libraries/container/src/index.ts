import 'reflect-metadata/lite';

import {
  type BindInFluentSyntax,
  type BindInWhenOnFluentSyntax,
  type BindOnFluentSyntax,
  type BindToFluentSyntax,
  type BindWhenFluentSyntax,
  type BindWhenOnFluentSyntax,
  type BoundServiceSyntax,
} from './binding/models/BindingFluentSyntax.js';
import { type BindingIdentifier } from './binding/models/BindingIdentifier.js';
import { type MapToResolvedValueInjectOptions } from './binding/models/MapToResolvedValueInjectOptions.js';
import {
  type ResolvedValueInjectOptions,
  type ResolvedValueMetadataInjectOptions,
  type ResolvedValueMetadataInjectTagOptions,
} from './binding/models/ResolvedValueInjectOptions.js';
import {
  type Bind,
  ContainerModule,
  type ContainerModuleLoadOptions,
  type IsBound,
  type OnActivation,
  type OnDeactivation,
  type Rebind,
  type RebindSync,
  type Unbind,
  type UnbindSync,
} from './container/models/ContainerModule.js';
import { type ContainerOptions } from './container/models/ContainerOptions.js';
import { type IsBoundOptions } from './container/models/isBoundOptions.js';
import { Container } from './container/services/Container.js';
import { InversifyContainerError } from './error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from './error/models/InversifyContainerErrorKind.js';

export type {
  Bind,
  BindInFluentSyntax,
  BindingIdentifier,
  BindInWhenOnFluentSyntax,
  BindOnFluentSyntax,
  BindToFluentSyntax,
  BindWhenFluentSyntax,
  BindWhenOnFluentSyntax,
  BoundServiceSyntax,
  ContainerModuleLoadOptions,
  ContainerOptions,
  IsBound,
  IsBoundOptions,
  MapToResolvedValueInjectOptions,
  OnActivation,
  OnDeactivation,
  Rebind,
  RebindSync,
  ResolvedValueInjectOptions,
  ResolvedValueMetadataInjectOptions,
  ResolvedValueMetadataInjectTagOptions,
  Unbind,
  UnbindSync,
};

export {
  Container,
  ContainerModule,
  InversifyContainerError,
  InversifyContainerErrorKind,
};
