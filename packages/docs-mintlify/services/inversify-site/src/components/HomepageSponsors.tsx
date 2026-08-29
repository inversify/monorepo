export default function HomepageSponsors() {
  return (
    <div className="homepage-sponsors">
      <h2 className="homepage-sponsors-title">Sponsors</h2>
      <p className="homepage-sponsors-subtitle">
        We are incredibly grateful for the support of our sponsors. Every
        contribution helps us maintain and improve InversifyJS.
      </p>
      <object
        data="/static/img/sponsors.svg"
        type="image/svg+xml"
        aria-label="Sponsors"
        className="homepage-sponsors-object"
      />
    </div>
  );
}
