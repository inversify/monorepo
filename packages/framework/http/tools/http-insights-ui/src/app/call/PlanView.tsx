import { type ReactElement } from 'react';

import {
  type Plan,
  type PlanBindingScope,
  type PlanBindingType,
  type PlanJsonValue,
  type PlanService,
  type PlanServiceIdentifier,
} from './planDetail.js';
import {
  type PlanBindingNode,
  type PlanPropertyNode,
  readPlanNodes,
  type PlanServiceNode,
} from './readPlanNodes.js';

export interface PlanViewProps {
  readonly plan: Plan;
}

export function PlanView(props: PlanViewProps): ReactElement {
  return (
    <section aria-label="Plan" className="plan">
      <h3>Plan</h3>
      <PlanServiceView
        anchorPrefix={props.plan.id}
        node={readPlanNodes(props.plan)}
      />
    </section>
  );
}

function PlanServiceView(props: {
  readonly anchorPrefix: string;
  readonly node: PlanServiceNode;
}): ReactElement {
  const label: string = props.node.service.serviceIdentifier.value;
  const anchor: string = `${props.anchorPrefix}-${props.node.service.id}`;

  if (props.node.reference) {
    return (
      <p className="plan-reference">
        <a href={`#${anchor}`}>{label}</a>
        <span className="plan-note">Shown above</span>
      </p>
    );
  }

  const chainedLabel: string | null = readChainedLabel(props.node.service);

  return (
    <article className="plan-service" id={anchor}>
      <div className="plan-service-title">
        <p className="plan-identifier">{label}</p>
        <p className="plan-chips">
          <span>
            {formatIdentifierKind(props.node.service.serviceIdentifier.kind)}
          </span>
          {props.node.service.optional ? <span>Optional</span> : null}
          {props.node.service.isMultiple ? <span>Multiple</span> : null}
          {chainedLabel === null ? null : <span>{chainedLabel}</span>}
        </p>
      </div>
      {props.node.service.name === null ? null : (
        <p className="plan-line">
          <span className="plan-label">Name</span>
          <span className="plan-identifier">
            {props.node.service.name.value}
          </span>
        </p>
      )}
      {props.node.service.tags.length === 0 ? null : (
        <ul className="plan-tags">
          {props.node.service.tags.map((tag, index): ReactElement => (
            <li key={`${tag.key.kind}-${tag.key.value}-${String(index)}`}>
              <span className="plan-identifier">{tag.key.value}</span>
              <span className="plan-note">{formatJson(tag.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {props.node.bindings.length === 0 ? (
        <p className="plan-hole">No binding</p>
      ) : (
        <ul className="plan-bindings">
          {props.node.bindings.map((binding: PlanBindingNode): ReactElement => (
            <li key={binding.binding.id}>
              <PlanBindingView
                anchorPrefix={props.anchorPrefix}
                node={binding}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PlanBindingView(props: {
  readonly anchorPrefix: string;
  readonly node: PlanBindingNode;
}): ReactElement {
  const scope: PlanBindingScope | null = readScope(props.node);

  return (
    <div className="plan-binding">
      <p className="plan-chips">
        <span>{formatBindingType(props.node.type)}</span>
        {scope === null ? null : <span>{scope}</span>}
        {props.node.binding.moduleId === null ? null : (
          <span>{`Module ${String(props.node.binding.moduleId)}`}</span>
        )}
        <span>{`Binding ${String(props.node.binding.bindingId)}`}</span>
      </p>
      {renderBindingBody(props.node, props.anchorPrefix)}
    </div>
  );
}

function renderBindingBody(
  node: PlanBindingNode,
  anchorPrefix: string,
): ReactElement | null {
  switch (node.type) {
    case 'ConstantValue':
    case 'DynamicValue':
    case 'Factory':
      return null;
    case 'Instance':
      return (
        <>
          <p className="plan-line">
            <span className="plan-label">Implementation</span>
            <span className="plan-identifier">
              {node.binding.implementationType.value}
            </span>
          </p>
          {node.constructorArguments.length === 0 ? null : (
            <>
              <p className="plan-label">Constructor</p>
              <ol className="plan-arguments">
                {node.constructorArguments.map(
                  (
                    argument: PlanServiceNode | null,
                    index: number,
                  ): ReactElement => (
                    <li key={readNodeKey(argument, index)}>
                      {argument === null ? (
                        <p className="plan-hole">No service</p>
                      ) : (
                        <PlanServiceView
                          anchorPrefix={anchorPrefix}
                          node={argument}
                        />
                      )}
                    </li>
                  ),
                )}
              </ol>
            </>
          )}
          {node.properties.length === 0 ? null : (
            <>
              <p className="plan-label">Properties</p>
              <ul className="plan-properties">
                {node.properties.map(
                  (property: PlanPropertyNode, index: number): ReactElement => (
                    <li key={readNodeKey(property.service, index)}>
                      <p className="plan-identifier">{property.key.value}</p>
                      <PlanServiceView
                        anchorPrefix={anchorPrefix}
                        node={property.service}
                      />
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </>
      );
    case 'ResolvedValue':
      return node.arguments.length === 0 ? null : (
        <>
          <p className="plan-label">Arguments</p>
          <ol className="plan-arguments">
            {node.arguments.map(
              (argument: PlanServiceNode, index: number): ReactElement => (
                <li key={readNodeKey(argument, index)}>
                  <PlanServiceView
                    anchorPrefix={anchorPrefix}
                    node={argument}
                  />
                </li>
              ),
            )}
          </ol>
        </>
      );
    case 'ServiceRedirection':
      return (
        <>
          <p className="plan-line">
            <span className="plan-label">Target</span>
            <span className="plan-identifier">
              {formatIdentifier(node.binding.targetServiceIdentifier)}
            </span>
          </p>
          <PlanServiceView
            anchorPrefix={anchorPrefix}
            node={node.redirection}
          />
        </>
      );
  }
}

function readScope(node: PlanBindingNode): PlanBindingScope | null {
  switch (node.type) {
    case 'ServiceRedirection':
      return null;
    case 'ConstantValue':
    case 'DynamicValue':
    case 'Factory':
    case 'Instance':
    case 'ResolvedValue':
      return node.binding.scope;
  }
}

function readChainedLabel(service: PlanService): string | null {
  if (!service.isMultiple || service.chained === null) {
    return null;
  }

  if (service.chained) {
    return 'Chained';
  }

  return 'Not chained';
}

function readNodeKey(node: PlanServiceNode | null, index: number): string {
  if (node === null) {
    return `hole-${String(index)}`;
  }

  return `${String(index)}-${node.service.id}`;
}

function formatIdentifier(identifier: PlanServiceIdentifier): string {
  return identifier.value;
}

function formatIdentifierKind(kind: PlanServiceIdentifier['kind']): string {
  switch (kind) {
    case 'class':
      return 'Class';
    case 'string':
      return 'String';
    case 'symbol':
      return 'Symbol';
  }
}

function formatBindingType(type: PlanBindingType): string {
  switch (type) {
    case 'ConstantValue':
      return 'Constant value';
    case 'DynamicValue':
      return 'Dynamic value';
    case 'Factory':
      return 'Factory';
    case 'Instance':
      return 'Instance';
    case 'ResolvedValue':
      return 'Resolved value';
    case 'ServiceRedirection':
      return 'Service redirection';
  }
}

function formatJson(value: PlanJsonValue): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}
