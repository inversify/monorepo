import { type MouseEvent, type ReactElement } from 'react';
import { Link, type NavigateFunction, useNavigate } from 'react-router';

import { executionPath } from '../execution/executionPath.js';
import { type ExecutionSummary } from '../executions/executionsApi.js';
import { DurationText } from './DurationText.js';
import { MethodBadge } from './MethodBadge.js';
import { StatusPill } from './StatusPill.js';

export interface ExecutionRowProps {
  readonly execution: ExecutionSummary;
}

export function ExecutionRow(props: ExecutionRowProps): ReactElement {
  const path: string = executionPath(props.execution.id);
  const navigate: NavigateFunction = useNavigate();

  return (
    <tr
      className="execution-row"
      onClick={(): void => {
        void navigate(path);
      }}
    >
      <td>
        <MethodBadge method={props.execution.method} />
      </td>
      <td className="url" title={props.execution.url}>
        <Link
          className="execution-link"
          onClick={(event: MouseEvent<HTMLAnchorElement>): void => {
            event.stopPropagation();
          }}
          to={path}
        >
          {props.execution.url}
        </Link>
      </td>
      <td>
        <StatusPill statusCode={props.execution.statusCode} />
      </td>
      <td>
        <DurationText durationMs={props.execution.durationMs} />
      </td>
    </tr>
  );
}
