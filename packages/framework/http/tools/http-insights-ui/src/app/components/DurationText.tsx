import { type ReactElement } from 'react';

const durationFormat: Intl.NumberFormat = new Intl.NumberFormat('en-US');

export interface DurationTextProps {
  readonly durationMs: number;
}

export function DurationText(props: DurationTextProps): ReactElement {
  return (
    <span className="duration">
      <span className="duration-value">
        {durationFormat.format(props.durationMs)}
      </span>
      <span className="duration-unit"> ms</span>
    </span>
  );
}
