export const HomepageHeader = () => {
  return (
    <header className="homepage-hero">
      <details className="homepage-language-dropdown">
        <summary className="homepage-language-dropdown-trigger">
          English
        </summary>
        <div className="homepage-language-dropdown-menu" role="listbox">
          <a
            className="homepage-language-dropdown-option homepage-language-dropdown-option-active"
            href="/"
            aria-current="page"
            role="option"
          >
            English
          </a>
          <a
            className="homepage-language-dropdown-option"
            href="/zh"
            role="option"
          >
            中文
          </a>
        </div>
      </details>
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
