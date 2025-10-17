import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import React from 'react';

export default function NotFound(): React.JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'theme.NotFound.title',
        message: 'Page Not Found',
      })}
    >
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <Heading as="h1" className="hero__title">
              <Translate
                id="theme.NotFound.title"
                description="The title of the 404 page"
              >
                Page Not Found
              </Translate>
            </Heading>
            <p>
              <Translate
                id="theme.NotFound.p1"
                description="The first paragraph of the 404 page"
              >
                We could not find what you were looking for.
              </Translate>
            </p>
            <div className="margin-vert--lg">
              <p>
                <strong>Note:</strong> This site is about to be removed.
              </p>
              <p>
                Please visit the{' '}
                <Link to="https://inversify.github.io/framework/">
                  InversifyJS Framework documentation
                </Link>{' '}
                for the latest information and migration guides.
              </p>
            </div>
            <div className="margin-top--lg">
              <Link
                className="button button--primary button--lg"
                to="https://inversify.github.io/framework/"
              >
                Go to Framework Docs
              </Link>
              <Link
                className="button button--secondary button--lg margin-left--md"
                to="/http/"
              >
                Go to HTTP Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
