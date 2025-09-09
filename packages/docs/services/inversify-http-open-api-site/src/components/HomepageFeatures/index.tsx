import jsSrc from '@site/static/img/js.png';
import plugSrc from '@site/static/img/plug.jpg';
import tsSrc from '@site/static/img/ts.png';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

interface FeatureItem {
  title: string;
  imgSrc: string;
  description: React.JSX.Element;
}

const FeatureList: FeatureItem[] = [
  {
    description: (
      <>
        InversifyJS is powered by TypeScript. TypeScript enable JavaScript
        developers to use highly-productive development tools and practices when
        developing JavaScript applications.
      </>
    ),
    imgSrc: tsSrc,
    title: 'Strongly Typed',
  },
  {
    description: (
      <>
        InversifyJS compiles to clean, simple JavaScript code which runs on any
        browser, in Node.js, or in any JavaScript engine that supports
        ECMAScript 2022 (or newer)
      </>
    ),
    imgSrc: jsSrc,
    title: 'Universal',
  },
  {
    description: (
      <>
        Inversifyjs is framework-agnostic and has been designed to in a way that
        makes possible its integration with popular frameworks and libraries
        like hapi, express, react or backbone.
      </>
    ),
    imgSrc: plugSrc,
    title: 'Pluggable',
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
