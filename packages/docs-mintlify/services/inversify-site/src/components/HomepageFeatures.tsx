interface FeatureItem {
  title: string;
  imgSrc: string;
  description: string;
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Strongly Typed',
    imgSrc: '/static/img/ts.png',
    description:
      'InversifyJS is powered by TypeScript. TypeScript enable JavaScript developers to use highly-productive development tools and practices when developing JavaScript applications.',
  },
  {
    title: 'Universal',
    imgSrc: '/static/img/js.png',
    description:
      'InversifyJS compiles to clean, simple JavaScript code which runs on any browser, in Node.js, or in any JavaScript engine that supports ECMAScript 2022 (or newer)',
  },
  {
    title: 'Pluggable',
    imgSrc: '/static/img/plug.jpg',
    description:
      'Inversifyjs is framework-agnostic and has been designed to in a way that makes possible its integration with popular frameworks and libraries like hapi, express, react or backbone.',
  },
];

function Feature({ title, imgSrc, description }: FeatureItem) {
  return (
    <div className="homepage-feature">
      <div className="homepage-feature-image">
        <img src={imgSrc} alt="" className="homepage-feature-img" />
      </div>
      <div className="homepage-feature-body">
        <h3 className="homepage-feature-title">{title}</h3>
        <p className="homepage-feature-description">{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className="homepage-features">
      <div className="homepage-features-container">
        {FeatureList.map((featureItem) => (
          <Feature key={featureItem.title} {...featureItem} />
        ))}
      </div>
    </section>
  );
}
