import type * as Preset from '@docusaurus/preset-classic';
import type { Config, LoadContext, Plugin } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  baseUrl: '/binding-decorators/',
  deploymentBranch: 'master',
  favicon: 'img/favicon.ico',
  future: {
    experimental_faster: true,
    v4: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  onBrokenLinks: 'throw',
  organizationName: 'inversify',
  plugins: [
    (_context: LoadContext): Plugin<unknown> => ({
      configureWebpack(_config: unknown, _isServer: boolean) {
        return {
          module: {
            rules: [
              {
                test: /\.txt/,
                type: 'asset/source',
              },
            ],
          },
        };
      },
      name: 'custom-asset-modules',
    }),
  ],
  presets: [
    [
      'classic',
      {
        blog: {
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineAuthors: 'warn',
          onInlineTags: 'warn',
          onUntruncatedBlogPosts: 'warn',
          showReadingTime: true,
        },
        docs: {
          includeCurrentVersion: true,
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  projectName: 'binding-decorators',
  tagline: 'An utility to declare InversifyJS bindings using decorators',
  themeConfig: {
    footer: {
      links: [
        {
          items: [
            {
              label: 'Tutorial',
              to: '/docs/introduction/getting-started',
            },
          ],
          title: 'Docs',
        },
        {
          items: [
            {
              href: 'https://discord.gg/jXcMagAPnm',
              label: 'Discord',
            },
          ],
          title: 'Community',
        },
        {
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              href: 'https://github.com/inversify/monorepo',
              label: 'GitHub',
            },
          ],
          title: 'More',
        },
      ],
      style: 'dark',
    },
    navbar: {
      items: [
        {
          label: 'Tutorial',
          position: 'left',
          sidebarId: 'tutorialSidebar',
          type: 'docSidebar',
        },
        { label: 'Blog', position: 'left', to: '/blog' },
        {
          href: 'https://github.com/inversify/monorepo',
          label: 'GitHub',
          position: 'right',
        },
      ],
      logo: {
        alt: 'Binding Decorators',
        src: 'img/logo.svg',
      },
      title: 'Binding Decorators',
    },
    prism: {
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
  title: 'Binding Decorators',
  trailingSlash: true,
  url: 'https://inversify.github.io',
};

export default config;
