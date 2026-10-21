import { type ReactElement } from 'react';

import { type ExecutionDetail } from './executionApi.js';
import {
  type ExecutionSectionId,
  isExecutionSectionEnabled,
} from './executionSections.js';

const SECTIONS: readonly ExecutionSectionOption[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'request', label: 'Request' },
  { id: 'middlewares', label: 'Middlewares' },
  { id: 'guards', label: 'Guards' },
  { id: 'controller', label: 'Controller' },
  { id: 'interceptors', label: 'Interceptors' },
  { id: 'response', label: 'Response' },
];

export interface ExecutionMenuProps {
  readonly execution: ExecutionDetail;
  readonly onSelect: (section: ExecutionSectionId) => void;
  readonly section: ExecutionSectionId;
}

export function ExecutionMenu(props: ExecutionMenuProps): ReactElement {
  return (
    <div
      aria-label="Execution sections"
      aria-orientation="vertical"
      className="section-menu"
      role="tablist"
    >
      {SECTIONS.map((option: ExecutionSectionOption): ReactElement => {
        const enabled: boolean = isExecutionSectionEnabled(
          option.id,
          props.execution,
        );
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

interface ExecutionSectionOption {
  readonly id: ExecutionSectionId;
  readonly label: string;
}

export function sectionTabId(section: ExecutionSectionId): string {
  return `execution-section-${section}`;
}
