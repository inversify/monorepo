import SponsorsSvg from '@site/static/img/sponsors.svg';
import Heading from '@theme/Heading';
import React from 'react';

import styles from './styles.module.css';

export default function HomepageSponsors(): React.JSX.Element {
  return (
    <div className={styles.sponsorsContainer}>
      <Heading as="h2" className={styles.sponsorsTitle}>
        Sponsors
      </Heading>
      <p className={styles.sponsorsSubtitle}>
        We are incredibly grateful for the support of our sponsors. Every
        contribution helps us maintain and improve InversifyJS.
      </p>
      <object
        data={SponsorsSvg}
        type="image/svg+xml"
        aria-label="Sponsors"
      ></object>
    </div>
  );
}
