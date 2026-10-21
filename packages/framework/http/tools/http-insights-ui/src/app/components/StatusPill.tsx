import { type ReactElement } from 'react';

import {
  formatHttpStatusCode,
  readHttpStatusCode,
} from '../executions/httpStatusCodes.js';

export interface StatusPillProps {
  readonly statusCode: number;
}

export function StatusPill(props: StatusPillProps): ReactElement {
  const known: ReturnType<typeof readHttpStatusCode> = readHttpStatusCode(
    props.statusCode,
  );
  const code: string = String(props.statusCode);
  const label: string =
    known === undefined ? code : formatHttpStatusCode(known);
  const reason: string | undefined = known?.reason;
  const statusClass: string = code.charAt(0);

  return (
    <span
      className="status-pill"
      data-class={statusClass === '' ? 'other' : statusClass}
      title={label}
    >
      <span className="status-code">{code}</span>
      {reason === undefined ? null : (
        <span className="status-reason"> {reason}</span>
      )}
    </span>
  );
}
