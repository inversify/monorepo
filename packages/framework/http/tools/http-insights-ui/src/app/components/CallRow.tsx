import { type MouseEvent, type ReactElement } from 'react';
import { Link, type NavigateFunction, useNavigate } from 'react-router';

import { callPath } from '../call/callPath.js';
import { type CallSummary } from '../calls/callsApi.js';
import { DurationText } from './DurationText.js';
import { MethodBadge } from './MethodBadge.js';
import { StatusPill } from './StatusPill.js';

export interface CallRowProps {
  readonly call: CallSummary;
}

export function CallRow(props: CallRowProps): ReactElement {
  const path: string = callPath(props.call.id);
  const navigate: NavigateFunction = useNavigate();

  return (
    <tr
      className="call-row"
      onClick={(): void => {
        void navigate(path);
      }}
    >
      <td>
        <MethodBadge method={props.call.method} />
      </td>
      <td className="url" title={props.call.url}>
        <Link
          className="call-link"
          onClick={(event: MouseEvent<HTMLAnchorElement>): void => {
            event.stopPropagation();
          }}
          to={path}
        >
          {props.call.url}
        </Link>
      </td>
      <td>
        <StatusPill statusCode={props.call.statusCode} />
      </td>
      <td>
        <DurationText durationMs={props.call.durationMs} />
      </td>
    </tr>
  );
}
