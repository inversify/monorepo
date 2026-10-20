import { type ReactElement } from 'react';

export interface StatusMessageProps {
  readonly actionLabel: string | undefined;
  readonly message: string;
  readonly onAction: (() => void) | undefined;
}

export function StatusMessage(props: StatusMessageProps): ReactElement {
  return (
    <div className="empty">
      <p>{props.message}</p>
      {props.actionLabel !== undefined && props.onAction !== undefined ? (
        <button className="text-button" onClick={props.onAction} type="button">
          {props.actionLabel}
        </button>
      ) : null}
    </div>
  );
}
