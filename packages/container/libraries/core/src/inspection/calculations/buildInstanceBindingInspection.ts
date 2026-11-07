import { buildBuildServiceNodeOptionsFromClassElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromClassElementMetadata.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { isConstructorNoParamNode } from '../../planning/calculations/isConstructorNoParamNode.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type ConstructorNoParamNode } from '../../planning/models/ConstructorNoParamNode.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type InstanceBindingInspection } from '../models/InstanceBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';

export function buildInstanceBindingInspection(
  buildPlanServiceInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ) => PlanServiceInspection,
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  node: InstanceBindingNode,
): InstanceBindingInspection {
  const classMetadata: ClassMetadata = node.classMetadata;

  // Planned params are only built for managed metadata, so the casts below hold
  const constructorArguments: (PlanServiceInspection | undefined)[] =
    node.constructorParams.map(
      (
        constructorParam: PlanServiceNode | ConstructorNoParamNode,
        index: number,
      ): PlanServiceInspection | undefined =>
        isConstructorNoParamNode(constructorParam)
          ? undefined
          : buildPlanServiceInspection(
              serviceInspections,
              constructorParam,
              buildBuildServiceNodeOptionsFromClassElementMetadata(
                classMetadata.constructorArguments[
                  index
                ] as ManagedClassElementMetadata,
              ),
            ),
    );

  const properties: Map<string | symbol, PlanServiceInspection> = new Map();

  for (const [propertyKey, propertyParam] of node.propertyParams) {
    properties.set(
      propertyKey,
      buildPlanServiceInspection(
        serviceInspections,
        propertyParam,
        buildBuildServiceNodeOptionsFromClassElementMetadata(
          classMetadata.properties.get(
            propertyKey,
          ) as ManagedClassElementMetadata,
        ),
      ),
    );
  }

  return {
    ...buildScopedBindingInspection(node.binding),
    constructorArguments,
    implementationType: node.binding.implementationType,
    properties,
  };
}
