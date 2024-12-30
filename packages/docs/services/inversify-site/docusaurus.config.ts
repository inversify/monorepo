import type * as Preset from '@docusaurus/preset-classic';
import type { Config, LoadContext, Plugin } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  baseUrl: '/monorepo',
  deploymentBranch: 'gh-pages',
  favicon: 'img/favicon.ico',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
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
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  projectName: 'monorepo',
  tagline:
    'A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript',
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
        alt: 'InversifyJS',
        src: 'img/logo.svg',
      },
      title: 'InversifyJS',
    },
    prism: {
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
  title: 'InversifyJS',
  url: 'https://inversify.github.io',
};

export default config;