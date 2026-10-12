import {
  type ActivePlugin,
  useActivePlugin,
} from '@docusaurus/plugin-content-docs/client';
import type { Props } from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import OriginalDocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import type { ReactNode } from 'react';

const defaultDocsPluginId: string = 'default';

export default function DocsVersionDropdownNavbarItem(props: Props): ReactNode {
  const activePlugin: ActivePlugin | undefined = useActivePlugin();
  const docsPluginId: string = props.docsPluginId ?? defaultDocsPluginId;

  if (activePlugin?.pluginId !== docsPluginId) {
    return null;
  }

  return <OriginalDocsVersionDropdownNavbarItem {...props} />;
}
