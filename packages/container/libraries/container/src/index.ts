import 'reflect-metadata/lite';

import {
  BindInFluentSyntax,
  BindInWhenOnFluentSyntax,
  BindOnFluentSyntax,
  BindToFluentSyntax,
  BindWhenFluentSyntax,
  BindWhenOnFluentSyntax,
  BoundServiceSyntax,
} from './binding/models/BindingFluentSyntax';
import { BindingIdentifier } from './binding/models/BindingIdentifier';
import { MapToResolvedValueInjectOptions } from './binding/models/MapToResolvedValueInjectOptions';
import {
  ResolvedValueInjectOptions,
  ResolvedValueMetadataInjectOptions,
  ResolvedValueMetadataInjectTagOptions,
} from './binding/models/ResolvedValueInjectOptions';
import {
  Bind,
  ContainerModule,
  ContainerModuleLoadOptions,
  IsBound,
  OnActivation,
  OnDeactivation,
  Rebind,
  RebindSync,
  Unbind,
  UnbindSync,
} from './container/models/ContainerModule';
import { ContainerOptions } from './container/models/ContainerOptions';
import { IsBoundOptions } from './container/models/isBoundOptions';
import { Container } from './container/services/Container';
import { InversifyContainerError } from './error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from './error/models/InversifyContainerErrorKind';

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
