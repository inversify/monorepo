import { DocusaurusContext } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';

import FixedBottomContainer from '../components/FixedBottomContainer';
import FrameworkBanner from '../components/FrameworkBanner';
import HomepageFeatures from '../components/HomepageFeatures';
import HomepageHeader from '../components/HomepageHeader';
import HomepageSponsors from '../components/HomepageSponsors';

export default function Home(): React.JSX.Element {
  const { siteConfig }: DocusaurusContext = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} docs`}
      description={`${siteConfig.title} documentation pages`}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageSponsors />
      </main>
      <FixedBottomContainer>
        <FrameworkBanner />
      </FixedBottomContainer>
    </Layout>
  );
}
