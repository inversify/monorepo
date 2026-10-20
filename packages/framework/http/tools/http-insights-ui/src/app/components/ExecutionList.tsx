import { type ReactElement, type ReactNode } from 'react';

import { type ExecutionSummary } from '../executions/executionsApi.js';
import { ExecutionRow } from './ExecutionRow.js';

export interface ExecutionListProps {
  readonly footer: ReactNode;
  readonly items: readonly ExecutionSummary[];
}

export function ExecutionList(props: ExecutionListProps): ReactElement {
  return (
    <>
      <div className="panel">
        <table className="executions">
          <caption className="sr-only">Recorded HTTP executions</caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">URL</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((execution: ExecutionSummary): ReactElement => (
              <ExecutionRow execution={execution} key={execution.id} />
            ))}
          </tbody>
        </table>
      </div>
      {props.footer}
    </>
  );
}
