export const HomepageHeader = () => {
  return (
    <header className="homepage-hero">
      <div className="homepage-hero-container">
        <h1 className="homepage-hero-title">InversifyJS</h1>
        <p className="homepage-hero-subtitle">
          A powerful and lightweight inversion of control container for
          JavaScript & Node.js apps powered by TypeScript
        </p>
        <div className="homepage-hero-buttons">
          <a
            className="homepage-hero-cta"
            href="/docs/introduction/getting-started"
          >
            Quick Start
          </a>
        </div>
      </div>
    </header>
  );
};
