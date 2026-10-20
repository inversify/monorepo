import { Search, X } from 'lucide-react';
import { type ChangeEvent, type ReactElement, type SubmitEvent } from 'react';

export interface SearchFieldProps {
  readonly onSearch: (requestUrlLike: string) => void;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
}

export function SearchField(props: SearchFieldProps): ReactElement {
  const onSubmit: (event: SubmitEvent<HTMLFormElement>) => void = (
    event: SubmitEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();
    props.onSearch(props.value.trim());
  };

  const onChange: (event: ChangeEvent<HTMLInputElement>) => void = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    props.onValueChange(event.target.value);
  };

  const onClear: () => void = (): void => {
    props.onValueChange('');
    props.onSearch('');
  };

  return (
    <form className="search" onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor="requestUrlLike">
        Search by URL
      </label>
      <input
        autoCapitalize="off"
        autoComplete="off"
        enterKeyHint="search"
        id="requestUrlLike"
        name="requestUrlLike"
        onChange={onChange}
        placeholder="Search by URL"
        spellCheck={false}
        type="search"
        value={props.value}
      />
      {props.value.length > 0 ? (
        <button
          aria-label="Clear search"
          className="clear"
          onClick={onClear}
          type="button"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
      ) : null}
      <button aria-label="Search" className="submit" type="submit">
        <Search aria-hidden="true" size={16} strokeWidth={1.75} />
      </button>
    </form>
  );
}
