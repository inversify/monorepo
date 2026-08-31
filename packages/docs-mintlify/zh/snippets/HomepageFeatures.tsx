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
            <h3 className="homepage-feature-title">强类型</h3>
            <p className="homepage-feature-description">
              InversifyJS 由 TypeScript 驱动。TypeScript 使 JavaScript
              开发人员在开发 JavaScript 应用程序时能够使用高效的开发工具和实践。
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
            <h3 className="homepage-feature-title">通用</h3>
            <p className="homepage-feature-description">
              InversifyJS 编译为干净、简单的 JavaScript
              代码，可在任何浏览器、Node.js 或任何支持 ECMAScript
              2022（或更新版本）的 JavaScript 引擎中运行。
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
            <h3 className="homepage-feature-title">可插拔</h3>
            <p className="homepage-feature-description">
              InversifyJS 与框架无关，其设计方式使其能够与 hapi、express、react
              或 backbone 等流行框架和库集成。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
