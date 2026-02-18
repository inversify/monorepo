import { type MultipleInjectionResolvedValueElementMetadata } from './MultipleInjectionResolvedValueElementMetadata.js';
import { type SingleInjectionResolvedValueElementMetadata } from './SingleInjectionResolvedValueElementMetadata.js';

export type ResolvedValueElementMetadata =
  | SingleInjectionResolvedValueElementMetadata
  | MultipleInjectionResolvedValueElementMetadata;
