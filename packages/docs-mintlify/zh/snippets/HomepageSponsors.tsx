export const HomepageSponsors = () => {
  return (
    <div className="homepage-sponsors">
      <h2 className="homepage-sponsors-title">赞助商</h2>
      <p className="homepage-sponsors-subtitle">
        我们非常感谢赞助商的支持。每一份贡献都帮助我们维护和改进 InversifyJS。
      </p>
      <object
        data="/static/img/sponsors.svg"
        type="image/svg+xml"
        aria-label="赞助商"
        className="homepage-sponsors-object"
      />
    </div>
  );
};
