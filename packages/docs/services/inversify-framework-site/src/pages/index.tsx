import { DocusaurusContext } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import controllerApiBasicsSource from '@inversifyjs/http-code-examples/generated/examples/v0/controllerApiBasics.ts.txt';
import homeAuthMiddlewareSource from '@inversifyjs/http-code-examples/generated/examples/v0/homeAuthMiddleware.ts.txt';
import homeServerSetupSource from '@inversifyjs/http-code-examples/generated/examples/v0/homeServerSetup.ts.txt';
import DocumentationButton from '@site/src/components/DocumentationButton';
import FeatureCard from '@site/src/components/FeatureCard';
import { CodeSnippet } from '@site/src/components/FloatingCodeSnippet';
import HomeFloatingCodeSnippets from '@site/src/components/HomeFloatingCodeSnippets';
import StatsCounter from '@site/src/components/StatsCounter';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import React from 'react';

import floatingCodeSnippetStyles from '../components/FloatingCodeSnippet/styles.module.css';
import styles from './index.module.css';

const codeSnippets: CodeSnippet[] = [
  {
    code: homeAuthMiddlewareSource,
    id: 1,
    language: 'typescript',
    title: 'Dependency Injection',
  },
  {
    code: homeServerSetupSource,
    id: 2,
    language: 'typescript',
    title: 'Server Setup',
  },
  {
    code: controllerApiBasicsSource,
    id: 3,
    language: 'typescript',
    title: 'RESTful Controllers',
  },
];

function HomepageHeader(): React.JSX.Element {
  const { siteConfig }: DocusaurusContext = useDocusaurusContext();

  return (
    <header className={styles.heroSection}>
      <div className={styles.heroBackground}></div>

      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroMain}>
            <div className={styles.heroLeft}>
              <Heading as="h1" className={styles.heroTitle}>
                Build <span className={styles.titleAccent}>HTTP APIs</span>
                <br />
                with{' '}
                <span className={styles.titleGradient}>
                  Dependency Injection
                </span>
              </Heading>
              <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
              <div className={styles.heroStats} style={{ display: 'none' }}>
                <StatsCounter label="Stars on GitHub" suffix="+" value={1000} />
                <StatsCounter label="Weekly Downloads" suffix="K+" value={50} />
                <StatsCounter
                  label="TypeScript Coverage"
                  suffix="%"
                  value={99}
                />
              </div>
              <div className={styles.heroButtons}>
                <DocumentationButton href="/docs/introduction/getting-started">
                  Get Started
                </DocumentationButton>
                <DocumentationButton href="https://github.com/inversify/monorepo">
                  View on GitHub
                </DocumentationButton>
              </div>
            </div>

            <div
              className={`${styles.heroRight ?? ''} ${floatingCodeSnippetStyles.homePageFloatingCodeContainer ?? ''}`}
            >
              <HomeFloatingCodeSnippets codeSnippets={codeSnippets} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Why Choose InversifyJS HTTP?
          </Heading>
        </div>

        <div className={styles.featuresGrid}>
          <FeatureCard
            accent={true}
            description="Minimal overhead with maximum performance. Built for production-scale applications."
            icon="🚀"
            title="Lightning Fast"
          />
          <FeatureCard
            description="Full TypeScript support with compile-time safety and excellent IDE integration."
            icon="🔧"
            title="Strongly Typed"
          />
          <FeatureCard
            description="Clean, expressive APIs using decorators for routes, middleware, and dependency injection."
            icon="🎯"
            title="Decorator-Driven"
          />
          <FeatureCard
            description="Works seamlessly with Express, Fastify, or any Node.js HTTP framework."
            icon="🌐"
            title="Framework Agnostic"
          />
          <FeatureCard
            description="Plugin system and middleware support for unlimited customization possibilities."
            icon="🔌"
            title="Highly Extensible"
          />
          <FeatureCard
            accent={true}
            description="Used in production by thousands of developers worldwide with comprehensive documentation."
            icon="📚"
            title="Battle Tested"
          />
        </div>

        <div className={styles.quickStartSection}>
          <div className={styles.quickStartHeader}>
            <Heading as="h3" className={styles.quickStartTitle}>
              Get started in seconds
            </Heading>
          </div>

          <div className={styles.quickStartActions}>
            <DocumentationButton href="/docs/introduction/getting-started">
              View Full Tutorial
            </DocumentationButton>
            <DocumentationButton
              href="https://github.com/inversify/monorepo"
              target="_blank"
            >
              View on GitHub
            </DocumentationButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig }: DocusaurusContext = useDocusaurusContext();
  return (
    <Layout
      description={`${siteConfig.title} - ${siteConfig.tagline}`}
      title={`${siteConfig.title} - Modern HTTP APIs with Dependency Injection`}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
