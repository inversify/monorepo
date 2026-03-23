import type { ReactNode } from 'react';

import { usePathTracker } from '../client/pathTracker';

interface RootProps {
  readonly children: ReactNode;
}

export default function Root(props: RootProps): ReactNode {
  usePathTracker();

  return <>{props.children}</>;
}
