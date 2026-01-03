import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

export default function HomepageHeader(): React.JSX.Element {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <Translate
            id="homepage.title"
            description="The title on the homepage"
          >
            InversifyJS
          </Translate>
        </Heading>
        <p className="hero__subtitle">
          <Translate
            id="homepage.tagline"
            description="The tagline on the homepage"
          >
            A powerful and lightweight inversion of control container for
            JavaScript & Node.js apps powered by TypeScript
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction/getting-started"
          >
            <Translate
              id="homepageHeader.quickStart"
              description="Label for the quick start button on the homepage header"
            >
              Quick Start
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}
