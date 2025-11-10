import { DocusaurusContext } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import FixedBottomContainer from '@site/src/components/FixedBottomContainer';
import FrameworkBanner from '@site/src/components/FrameworkBanner';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageHeader from '@site/src/components/HomepageHeader';
import Layout from '@theme/Layout';
import React from 'react';

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
      </main>
      <FixedBottomContainer>
        <FrameworkBanner />
      </FixedBottomContainer>
    </Layout>
  );
}
