export const HomepageFeatures = () => {
  return (
    <section className="homepage-features">
      <div className="homepage-features-container">
        <div className="homepage-feature">
          <div className="homepage-feature-image">
            <img
              src="/static/img/ts.png"
              alt=""
              className="homepage-feature-img"
            />
          </div>
          <div className="homepage-feature-body">
            <h3 className="homepage-feature-title">Strongly Typed</h3>
            <p className="homepage-feature-description">
              InversifyJS is powered by TypeScript. TypeScript enable JavaScript
              developers to use highly-productive development tools and
              practices when developing JavaScript applications.
            </p>
          </div>
        </div>
        <div className="homepage-feature">
          <div className="homepage-feature-image">
            <img
              src="/static/img/js.png"
              alt=""
              className="homepage-feature-img"
            />
          </div>
          <div className="homepage-feature-body">
            <h3 className="homepage-feature-title">Universal</h3>
            <p className="homepage-feature-description">
              InversifyJS compiles to clean, simple JavaScript code which runs
              on any browser, in Node.js, or in any JavaScript engine that
              supports ECMAScript 2022 (or newer)
            </p>
          </div>
        </div>
        <div className="homepage-feature">
          <div className="homepage-feature-image">
            <img
              src="/static/img/plug.jpg"
              alt=""
              className="homepage-feature-img"
            />
          </div>
          <div className="homepage-feature-body">
            <h3 className="homepage-feature-title">Pluggable</h3>
            <p className="homepage-feature-description">
              Inversifyjs is framework-agnostic and has been designed to in a
              way that makes possible its integration with popular frameworks
              and libraries like hapi, express, react or backbone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
