import { type ReactElement, type ReactNode } from 'react';

import { Brand } from './Brand.js';
import { ThemeSwitch } from './ThemeSwitch.js';

export interface AppShellProps {
  readonly children: ReactNode;
  readonly wide?: boolean;
}

export function AppShell(props: AppShellProps): ReactElement {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Brand />
          <ThemeSwitch />
        </div>
      </header>
      <main className={props.wide === true ? 'page page-detail' : 'page'}>
        {props.children}
      </main>
    </>
  );
}
