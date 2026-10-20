import { type ReactElement } from 'react';

const KNOWN_METHODS: ReadonlySet<string> = new Set([
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
]);

export interface MethodBadgeProps {
  readonly method: string;
}

export function MethodBadge(props: MethodBadgeProps): ReactElement {
  const method: string = props.method.toUpperCase();
  const badgeMethod: string = KNOWN_METHODS.has(method) ? method : 'OTHER';

  return (
    <span className="method" data-method={badgeMethod}>
      {method}
    </span>
  );
}
