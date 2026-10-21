import { type ReactElement, type ReactNode } from 'react';

import { type CallSummary } from '../calls/callsApi.js';
import { CallRow } from './CallRow.js';

export interface CallListProps {
  readonly footer: ReactNode;
  readonly items: readonly CallSummary[];
}

export function CallList(props: CallListProps): ReactElement {
  return (
    <>
      <div className="panel">
        <table className="calls">
          <caption className="sr-only">Recorded HTTP calls</caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">URL</th>
              <th scope="col">Status</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((call: CallSummary): ReactElement => (
              <CallRow call={call} key={call.id} />
            ))}
          </tbody>
        </table>
      </div>
      {props.footer}
    </>
  );
}
