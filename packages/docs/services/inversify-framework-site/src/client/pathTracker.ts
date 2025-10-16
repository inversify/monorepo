import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { useLocation } from '@docusaurus/router';
import { useEffect } from 'react';

/**
 * Hook that adds data-path attribute to the document element
 * to enable path-based CSS selectors for showing/hiding version dropdowns
 */
export function usePathTracker(): void {
  // eslint-disable-next-line @typescript-eslint/typedef
  const location = useLocation();

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    const path: string = location.pathname;
    document.documentElement.setAttribute('data-path', path);

    return (): void => {
      document.documentElement.removeAttribute('data-path');
    };
  }, [location.pathname]);
}
