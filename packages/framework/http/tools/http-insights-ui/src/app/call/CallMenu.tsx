import { type ReactElement } from 'react';

import { type CallDetail } from './callApi.js';
import { type CallSectionId, isCallSectionEnabled } from './callSections.js';

const SECTIONS: readonly CallSectionOption[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'request', label: 'Request' },
  { id: 'middlewares', label: 'Middlewares' },
  { id: 'guards', label: 'Guards' },
  { id: 'controller', label: 'Controller' },
  { id: 'interceptors', label: 'Interceptors' },
  { id: 'response', label: 'Response' },
];

export interface CallMenuProps {
  readonly call: CallDetail;
  readonly onSelect: (section: CallSectionId) => void;
  readonly section: CallSectionId;
}

export function CallMenu(props: CallMenuProps): ReactElement {
  return (
    <div
      aria-label="Call sections"
      aria-orientation="vertical"
      className="section-menu"
      role="tablist"
    >
      {SECTIONS.map((option: CallSectionOption): ReactElement => {
        const enabled: boolean = isCallSectionEnabled(option.id, props.call);
        const selected: boolean = props.section === option.id;

        return (
          <button
            aria-selected={selected}
            disabled={!enabled}
            id={sectionTabId(option.id)}
            key={option.id}
            onClick={(): void => {
              props.onSelect(option.id);
            }}
            role="tab"
            title={
              enabled ? undefined : `No ${option.label.toLowerCase()} recorded`
            }
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface CallSectionOption {
  readonly id: CallSectionId;
  readonly label: string;
}

export function sectionTabId(section: CallSectionId): string {
  return `call-section-${section}`;
}
