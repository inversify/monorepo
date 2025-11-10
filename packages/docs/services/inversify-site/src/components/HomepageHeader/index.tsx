import Link from '@docusaurus/Link';
import { DocusaurusContext } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

export default function HomepageHeader(): React.JSX.Element {
  const { siteConfig }: DocusaurusContext = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction/getting-started"
          >
            Quick Start
          </Link>
        </div>
      </div>
    </header>
  );
}
