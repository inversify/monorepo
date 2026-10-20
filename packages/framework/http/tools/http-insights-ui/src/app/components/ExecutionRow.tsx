import { type ReactElement } from 'react';

import { type ExecutionSummary } from '../executions/executionsApi.js';
import { DurationText } from './DurationText.js';
import { MethodBadge } from './MethodBadge.js';

export interface ExecutionRowProps {
  readonly execution: ExecutionSummary;
}

export function ExecutionRow(props: ExecutionRowProps): ReactElement {
  return (
    <tr>
      <td>
        <MethodBadge method={props.execution.method} />
      </td>
      <td className="url" title={props.execution.url}>
        {props.execution.url}
      </td>
      <td>
        <DurationText durationMs={props.execution.durationMs} />
      </td>
    </tr>
  );
}
