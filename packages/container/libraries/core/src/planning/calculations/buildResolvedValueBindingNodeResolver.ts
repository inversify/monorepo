// import { type ServiceIdentifier } from '@inversifyjs/common';

// import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
// import { type ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata.js';
// import { resolveBindingServiceActivations } from '../../resolution/actions/resolveBindingServiceActivations.js';
// import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
// import {
//   type Resolved,
//   type SyncResolved,
// } from '../../resolution/models/Resolved.js';
// import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';

// function buildSimpleInstanceBindingNodeResolver<TActivated>(
//   binding: ResolvedValueBinding<TActivated>,
//   resolvedValueMetadata: ResolvedValueMetadata,
//   node: ResolvedValueBindingNode<TActivated, ResolvedValueBindings<TActivated>>,
// ): (params: ResolutionParams) => Resolved<TActivated> {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const factory: (...args: any[]) => Resolved<TActivated> = binding.factory;
//   const serviceIdentifier: ServiceIdentifier<TActivated> =
//     binding.serviceIdentifier;

//   function resolveInstanceActivations(
//     params: ResolutionParams,
//     resolvedValue: SyncResolved<TActivated>,
//   ): Resolved<TActivated> {
//     if (params.getActivations(serviceIdentifier) === undefined) {
//       return resolvedValue;
//     }

//     return resolveBindingServiceActivations<TActivated>(
//       params,
//       serviceIdentifier,
//       resolvedValue,
//     );
//   }

//   let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

//   switch (resolvedValueMetadata.arguments.length) {
//     default:
//   }
// }
