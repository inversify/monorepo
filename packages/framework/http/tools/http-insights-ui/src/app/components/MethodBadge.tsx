import { type ReactElement } from 'react';

export const HTTP_METHODS: readonly string[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

const KNOWN_METHODS: ReadonlySet<string> = new Set(HTTP_METHODS);

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
