"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Earth's Pulse route error:", error);
  }, [error]);

  return (
    <div className="shell status-page">
      <div className="status-page-grid">
        <span aria-hidden="true" className="status-code">
          500
        </span>
        <div>
          <h1>This view failed to render</h1>
          <p>
            An unexpected error interrupted the page. No data was altered. You
            can retry this route or return to the Explore view.
          </p>
          <div className="status-actions">
            <button className="button-primary" onClick={reset} type="button">
              Retry view
            </button>
            <Link className="text-link" href="/">
              Return to Explore
            </Link>
          </div>
          {error.digest ? (
            <p className="error-reference">Reference: {error.digest}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
