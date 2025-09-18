import { DocusaurusContext } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import consoleLoggerSource from '@inversifyjs/logger-code-examples/generated/examples/v1/consoleLogger.ts.txt';
import fileLoggerSource from '@inversifyjs/logger-code-examples/generated/examples/v1/fileLogger.ts.txt';
import httpLoggerSource from '@inversifyjs/logger-code-examples/generated/examples/v1/httpLogger.ts.txt';
import DocumentationButton from '@site/src/components/DocumentationButton';
import FeatureCard from '@site/src/components/FeatureCard';
import { CodeSnippet } from '@site/src/components/FloatingCodeSnippet';
import HomeFloatingCodeSnippets from '@site/src/components/HomeFloatingCodeSnippets';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import React from 'react';

import floatingCodeSnippetStyles from '../components/FloatingCodeSnippet/styles.module.css';
import styles from './index.module.css';

const codeSnippets: CodeSnippet[] = [
  {
    code: fileLoggerSource,
    id: 1,
    language: 'typescript',
    title: 'File Logger',
  },
  {
    code: httpLoggerSource,
    id: 2,
    language: 'typescript',
    title: 'HTTP Logger',
  },
  {
    code: consoleLoggerSource,
    id: 3,
    language: 'typescript',
    title: 'Console Logger',
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
              <div className={styles.heroButtons}>
                <DocumentationButton href="/docs/introduction/getting-started">
                  Get Started
                </DocumentationButton>
                <DocumentationButton
                  href="https://github.com/inversify/monorepo"
                  target="_blank"
                >
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
            Why Choose Inversify Loggers?
          </Heading>
        </div>

        <div className={styles.featuresGrid}>
          <FeatureCard
            accent={true}
            description="Simple to use yet completely featured logging library for Node.js applications."
            icon="🎯"
            title="Simple"
          />
          <FeatureCard
            description="Log levels conform to the RFC 5424 specification."
            icon="🔧"
            title="Spec compliant"
          />
          <FeatureCard
            description="Use them in any NodeJS application."
            icon="🌐"
            title="Framework Agnostic"
          />
          <FeatureCard
            description="The inversify framework integrates seamlessly with inversify loggers to help you use them with little or no effort."
            icon="🔌"
            title="Integrated"
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
            <DocumentationButton href="https://github.com/inversify/monorepo">
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
