import { X } from 'lucide-react';
import { type ReactElement } from 'react';

import { type CallFilters } from '../calls/callsApi.js';

export interface FilterChipsProps {
  readonly filters: CallFilters;
  readonly onFiltersChange: (filters: CallFilters) => void;
}

export function FilterChips(props: FilterChipsProps): ReactElement | null {
  const chips: readonly FilterChip[] = readFilterChips(
    props.filters,
    props.onFiltersChange,
  );

  if (chips.length === 0) {
    return null;
  }

  return (
    <ul aria-label="Active filters" className="filter-chips">
      {chips.map((chip: FilterChip): ReactElement => (
        <li className="filter-chip" key={chip.label}>
          <span>{chip.label}</span>
          <button
            aria-label={chip.removeLabel}
            onClick={chip.onRemove}
            type="button"
          >
            <X aria-hidden="true" size={14} strokeWidth={1.75} />
          </button>
        </li>
      ))}
    </ul>
  );
}

interface FilterChip {
  readonly label: string;
  readonly onRemove: () => void;
  readonly removeLabel: string;
}

function readFilterChips(
  filters: CallFilters,
  onFiltersChange: (filters: CallFilters) => void,
): readonly FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.requestMethod !== undefined) {
    const requestMethod: string = filters.requestMethod;

    chips.push({
      label: `method is ${requestMethod}`,
      onRemove: (): void => {
        onFiltersChange({
          requestMethod: undefined,
          responseStatusCode: filters.responseStatusCode,
        });
      },
      removeLabel: 'Remove method filter',
    });
  }

  if (filters.responseStatusCode !== undefined) {
    const responseStatusCode: number = filters.responseStatusCode;

    chips.push({
      label: `status is ${String(responseStatusCode)}`,
      onRemove: (): void => {
        onFiltersChange({
          requestMethod: filters.requestMethod,
          responseStatusCode: undefined,
        });
      },
      removeLabel: 'Remove status filter',
    });
  }

  return chips;
}
