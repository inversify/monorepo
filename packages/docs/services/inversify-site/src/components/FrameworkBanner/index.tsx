import Translate from '@docusaurus/Translate';
import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import DocumentationButton from '../DocumentationButton';
import styles from './styles.module.css';

export default function FrameworkBanner(): React.JSX.Element {
  const [isOpen, setIsOpen]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false);

  return (
    <section className={styles.frameworkBanner}>
      <div className={styles.bannerContent}>
        <button
          className={styles.accordionButton}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
        >
          <div className={styles.accordionHeader}>
            <div className={styles.bannerBadge}>
              <span className={styles.pulse}></span>
              NEW
            </div>
            <div className={styles.accordionHeaderContent}>
              <span className={styles.bannerTitle}>
                <span className={styles.titleFull}>
                  🚀 Introducing InversifyJS Framework
                </span>
                <span className={styles.titleMobile}>Framework</span>
              </span>
            </div>
            <Icon
              icon="carbon:chevron-down-outline"
              className={styles.chevronIcon}
            />
          </div>
        </button>

        <div
          className={[
            styles.accordionContent,
            isOpen ? styles.accordionContentOpen : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <p className={styles.bannerDescription}>
            <Translate
              id="frameworkBanner.description"
              description="Description for the framework banner on the homepage"
            >
              Take your dependency injection to the next level with our new
              framework! Build modern web applications with built-in support for
              HTTP, routing, and more.
            </Translate>
          </p>
          <div className={styles.bannerButtons}>
            <DocumentationButton href="https://inversify.io/framework/">
              <Translate
                id="frameworkBanner.exploreButton"
                description="Label for the explore framework button on the framework banner"
              >
                Explore Framework
              </Translate>
            </DocumentationButton>
          </div>
        </div>
      </div>
    </section>
  );
}
