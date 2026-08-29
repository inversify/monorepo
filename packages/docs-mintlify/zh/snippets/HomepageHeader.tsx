export const HomepageHeader = () => {
  return (
    <header className="homepage-hero">
      <div className="homepage-hero-container">
        <h1 className="homepage-hero-title">InversifyJS</h1>
        <p className="homepage-hero-subtitle">
          一个强大且轻量级的控制反转容器，适用于由 TypeScript 驱动的 JavaScript
          和 Node.js 应用程序
        </p>
        <div className="homepage-hero-buttons">
          <a
            className="homepage-hero-cta"
            href="/zh/docs/introduction/getting-started"
          >
            快速开始
          </a>
        </div>
      </div>
    </header>
  );
};
