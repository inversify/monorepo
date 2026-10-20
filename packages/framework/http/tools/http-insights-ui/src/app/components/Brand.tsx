import { type ReactElement } from 'react';

import logoUrl from '../assets/logo.svg';

export function Brand(): ReactElement {
  return (
    <div className="brand">
      <img
        alt="Inversify"
        className="mark"
        height={28}
        src={logoUrl}
        width={28}
      />
      <span className="brand-name">HTTP Insights</span>
    </div>
  );
}
