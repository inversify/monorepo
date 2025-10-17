import type * as Preset from '@docusaurus/preset-classic';
import type { Config, LoadContext, Plugin } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  baseUrl: '/framework/',
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
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'logger',
        path: 'logger-docs',
        routeBasePath: 'logger',
        sidebarPath: './sidebarsLogger.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'openapi',
        path: 'openapi-docs',
        routeBasePath: 'openapi',
        sidebarPath: './sidebarsOpenApi.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'validation',
        path: 'validation-docs',
        routeBasePath: 'validation',
        sidebarPath: './sidebarsValidation.ts',
      },
    ],
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
  projectName: 'framework',
  tagline: 'A powerful set of tools to create HTTP APIs on top of InversifyJS',
  themeConfig: {
    algolia: {
      apiKey: 'd662eb902793e5d4c1f11d049fb18cdd',
      appId: '8BIUPXYCF9',
      contextualSearch: true,
      indexName: 'crawler_inversify-http',
      insights: false,
    },
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
              label: 'HTTP Docs',
              to: '/docs/introduction/getting-started',
            },
            {
              label: 'Logger Docs',
              to: '/logger/introduction/getting-started',
            },
            {
              label: 'OpenApi Docs',
              to: '/openapi/introduction/getting-started',
            },
            {
              label: 'Validation Docs',
              to: '/validation/introduction/getting-started',
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
          items: [
            {
              label: 'HTTP Docs',
              to: '/docs/introduction/getting-started',
            },
            {
              label: 'Logger Docs',
              to: '/logger/introduction/getting-started',
            },
            {
              label: 'OpenApi Docs',
              to: '/openapi/introduction/getting-started',
            },
            {
              label: 'Validation Docs',
              to: '/validation/introduction/getting-started',
            },
          ],
          label: 'Docs',
          type: 'dropdown',
        },
        { label: 'Blog', position: 'left', to: '/blog' },
        {
          className: 'navbar-version-dropdown-main',
          position: 'right',
          type: 'docsVersionDropdown',
        },
        {
          className: 'navbar-version-dropdown-logger',
          docsPluginId: 'logger',
          position: 'right',
          type: 'docsVersionDropdown',
        },
        {
          className: 'navbar-version-dropdown-openapi',
          docsPluginId: 'openapi',
          position: 'right',
          type: 'docsVersionDropdown',
        },
        {
          className: 'navbar-version-dropdown-validation',
          docsPluginId: 'validation',
          position: 'right',
          type: 'docsVersionDropdown',
        },
        {
          href: 'https://github.com/inversify/monorepo',
          label: 'GitHub',
          position: 'right',
        },
      ],
      logo: {
        alt: 'Inversify Framework Logo',
        src: 'img/logo.svg',
      },
      title: 'Inversify Framework',
    },
    prism: {
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
  title: 'Inversify Framework',
  trailingSlash: true,
  url: 'https://inversify.github.io',
};

export default config;
