import type * as Preset from '@docusaurus/preset-classic';
import type { Config, LoadContext, Plugin } from '@docusaurus/types';
import { rspack, WebpackPluginInstance } from '@rspack/core';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  baseUrl: '/',
  deploymentBranch: 'master',
  favicon: 'img/favicon.ico',
  future: {
    experimental_faster: true,
    v4: true,
  },
  i18n: {
    defaultLocale: 'en',
    localeConfigs: {
      zh: {
        direction: 'ltr',
        htmlLang: 'zh-CN',
        label: '简体中文',
        path: 'zh',
        translate: true,
      },
    },
    locales: ['en', 'zh'],
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
          plugins: [
            new MonacoWebpackPlugin(),
            new rspack.CopyRspackPlugin({
              patterns: [
                {
                  from: require.resolve('@inversifyjs/react-code-runner/inversifyBundle.js'),
                  to: 'inversify.js',
                },
              ],
            }) as WebpackPluginInstance,
          ],
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
  projectName: 'inversify.github.io',
  tagline:
    'A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript',
  themeConfig: {
    algolia: {
      apiKey: 'bba69c8b4ce0627641339d92e177cdc1',
      appId: 'FJYVAGM6L7',
      contextualSearch: true,
      indexName: 'inversify',
      insights: false,
    },
    announcementBar: {
      content:
        'Your feedback is important to us! Please take a moment to read the <a target="_blank" rel="noopener noreferrer" href="/blog/announcing-inversify-8-0-0-beta-0/">v8 beta announcement</a>',
      id: 'announcing_v8',
      isCloseable: true,
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
          position: 'left',
          type: 'localeDropdown',
        },
        {
          label: 'Tutorial',
          position: 'left',
          sidebarId: 'tutorialSidebar',
          type: 'docSidebar',
        },
        { label: 'Blog', position: 'left', to: '/blog' },
        {
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
  trailingSlash: true,
  url: 'https://inversify.github.io',
};

export default config;
