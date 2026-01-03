import Translate from '@docusaurus/Translate';
import jsSrc from '@site/static/img/js.png';
import plugSrc from '@site/static/img/plug.jpg';
import tsSrc from '@site/static/img/ts.png';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

interface FeatureItem {
  title: React.JSX.Element;
  imgSrc: string;
  description: React.JSX.Element;
}

const FeatureList: FeatureItem[] = [
  {
    description: (
      <Translate
        id="homepageFeatures.stronglyTyped.description"
        description="Description for the strongly typed feature on the homepage"
      >
        InversifyJS is powered by TypeScript. TypeScript enable JavaScript
        developers to use highly-productive development tools and practices when
        developing JavaScript applications.
      </Translate>
    ),
    imgSrc: tsSrc,
    title: (
      <Translate id="homepageFeatures.stronglyTyped.title">
        Strongly Typed
      </Translate>
    ),
  },
  {
    description: (
      <Translate
        id="homepageFeatures.universal.description"
        description="Description for the universal feature on the homepage"
      >
        InversifyJS compiles to clean, simple JavaScript code which runs on any
        browser, in Node.js, or in any JavaScript engine that supports
        ECMAScript 2022 (or newer)
      </Translate>
    ),
    imgSrc: jsSrc,
    title: (
      <Translate id="homepageFeatures.universal.title">Universal</Translate>
    ),
  },
  {
    description: (
      <Translate
        id="homepageFeatures.pluggable.description"
        description="Description for the pluggable feature on the homepage"
      >
        Inversifyjs is framework-agnostic and has been designed to in a way that
        makes possible its integration with popular frameworks and libraries
        like hapi, express, react or backbone.
      </Translate>
    ),
    imgSrc: plugSrc,
    title: (
      <Translate id="homepageFeatures.pluggable.title">Pluggable</Translate>
    ),
  },
];

function Feature({ title, imgSrc, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} src={imgSrc} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((featureItem: FeatureItem, index: number) => (
            <Feature key={index} {...featureItem} />
          ))}
        </div>
      </div>
    </section>
  );
}
