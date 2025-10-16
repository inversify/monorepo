import { usePathTracker } from '@site/src/client/pathTracker';
import type { ReactNode } from 'react';

interface RootProps {
  readonly children: ReactNode;
}

export default function Root(props: RootProps): ReactNode {
  usePathTracker();

  return <>{props.children}</>;
}
