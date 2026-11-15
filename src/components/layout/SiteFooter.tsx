import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <span className="footer-name">Earth’s Pulse</span>
          <span className="footer-challenge">NASA Space Apps Challenge</span>
        </div>

        <p className="footer-credit">
          Data:{" "}
          <Link href="/data-sources">ocean, carbon, and air-quality records</Link>.
        </p>

        <p className="footer-note">
          Independent project. Not an official NASA product.
        </p>
      </div>
    </footer>
  );
}
