import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested Earth's Pulse page does not exist.",
};

export default function NotFound() {
  return (
    <div className="shell status-page">
      <div className="status-page-grid">
        <span aria-hidden="true" className="status-code">
          404
        </span>
        <div>
          <h1>No such route</h1>
          <p>
            This address is not part of the Earth&apos;s Pulse interface. The
            visualization, source record, and data documentation are still
            available from the main routes.
          </p>
          <div className="status-actions">
            <Link className="button-primary" href="/">
              Return to Explore
            </Link>
            <Link className="text-link" href="/data-sources">
              View data sources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
