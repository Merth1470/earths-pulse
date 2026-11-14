import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { StatusTag } from "@/components/ui/StatusTag";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "Data Sources",
  description:
    "Verified provenance for Earth's Pulse: NASA SVS record 3912, the ECCO2 model, what the rendered image can and cannot tell us, and unresolved numerical-data access.",
};

const contents = [
  { href: "#record", label: "Source record" },
  { href: "#layers", label: "Three layers" },
  { href: "#limits", label: "Image limits" },
  { href: "#access", label: "Access limits" },
  { href: "#license", label: "Licensing" },
  { href: "#citation", label: "Citation" },
];

const assets = [
  {
    name: "NASA SVS record 3912",
    role: "Page, credits, media index",
    state: "Verified",
    tone: "available" as const,
    href: NASA_SVS_RECORD.pageUrl,
    linkLabel: "Record",
  },
  {
    name: "NASA SVS Page API",
    role: "Machine-readable metadata",
    state: "Verified 14 Nov 2026",
    tone: "available" as const,
    href: NASA_SVS_RECORD.apiUrl,
    linkLabel: "API",
  },
  {
    name: "ECCO2 rendered still",
    role: "NASA rendered visualization",
    state: "Bundled, 1.0 MB",
    tone: "available" as const,
    href: NASA_SVS_RECORD.still.src,
    linkLabel: "JPEG",
  },
  {
    name: "ECCO product overview",
    role: "Model context and resolution",
    state: "Verified",
    tone: "available" as const,
    href: "https://ecco-group.org/products.htm",
    linkLabel: "ECCO",
  },
  {
    name: "ECCO2 numerical fields",
    role: "Original scientific data",
    state: "Not obtained",
    tone: "blocked" as const,
    href: "https://ecco-group.org/datasets.htm",
    linkLabel: "Access",
  },
  {
    name: "ECCO V4r4 at PO.DAAC",
    role: "Current ECCO distribution",
    state: "Not used — different release",
    tone: "neutral" as const,
    href: "https://podaac.jpl.nasa.gov/ECCO",
    linkLabel: "PO.DAAC",
  },
];

export default function DataSourcesPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 01</span>
            <span>Source validation</span>
            <span>{NASA_SVS_RECORD.validatedOn}</span>
          </>
        }
        lede="What is real, what is rendered, and what is still missing. This page separates the original scientific data, NASA's visualization, and any derived material so none of them borrows the authority of another."
        title="Data sources and provenance"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <div className="source-summary">
              <div>
                <p className="aside-label">Visualization</p>
                <p className="source-summary-title">{NASA_SVS_RECORD.title}</p>
                <p>
                  NASA Scientific Visualization Studio, record{" "}
                  {NASA_SVS_RECORD.id}. Released {NASA_SVS_RECORD.releaseLabel}.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Model</dt>
                  <dd>ECCO2 / MITgcm</dd>
                </div>
                <div>
                  <dt>Period</dt>
                  <dd className="record-mono">{NASA_SVS_RECORD.period.label}</dd>
                </div>
                <div>
                  <dt>Coverage</dt>
                  <dd>Global ocean surface</dd>
                </div>
              </dl>
            </div>
            <p className="prose">
              NASA&apos;s visualization is built from ECCO2 model output, which
              synthesizes satellite and in-situ observations with the MIT general
              circulation model. NASA renders surface current flow and colors it
              by sea surface temperature. The render is not a live observation,
              and the model is not a direct measurement at every point.
            </p>
          </section>

          <section className="prose-section" id="record">
            <h2>Source record</h2>
            <p className="prose">
              Every row below was checked against its publisher. The last two
              rows are explicitly not part of this build.
            </p>

            <div
              aria-label="Verified assets and their status"
              className="table-wrap"
              role="region"
              tabIndex={0}
            >
              <table className="record-table" role="table">
                <caption className="sr-only">
                  NASA and ECCO assets used or evaluated for Earth&apos;s Pulse,
                  with their role and access status.
                </caption>
                <thead role="rowgroup">
                  <tr role="row">
                    <th role="columnheader" scope="col">Asset</th>
                    <th role="columnheader" scope="col">Role</th>
                    <th role="columnheader" scope="col">State</th>
                    <th role="columnheader" scope="col">Link</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {assets.map((asset) => (
                    <tr key={asset.name} role="row">
                      <th role="rowheader" scope="row">{asset.name}</th>
                      <td data-label="Role" role="cell">{asset.role}</td>
                      <td data-label="State" role="cell">
                        <StatusTag tone={asset.tone}>{asset.state}</StatusTag>
                      </td>
                      <td data-label="Link" role="cell">
                        <a
                          className="table-link"
                          href={asset.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {asset.linkLabel}
                          <ArrowUpRight aria-hidden="true" size={11} strokeWidth={1.6} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="prose-section" id="layers">
            <h2>Three layers of evidence</h2>
            <ol className="layer-list">
              <li>
                <span aria-hidden="true" className="layer-index">01</span>
                <div>
                  <div className="layer-heading">
                    <h3>Original scientific data</h3>
                    <StatusTag tone="blocked">Not connected</StatusTag>
                  </div>
                  <p>
                    The ECCO2 ocean and sea-ice state estimate. The variables of
                    interest are surface temperature and the eastward and
                    northward velocity components. NASA&apos;s Page API publishes
                    rendered media and metadata, not these numerical fields.
                  </p>
                  <p className="layer-limit">
                    The legacy ECCO JPL data host was unreachable during
                    validation. PO.DAAC requires NASA Earthdata Login, and its
                    current ECCO V4r4 product is not the release used for the
                    2012 render.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">02</span>
                <div>
                  <div className="layer-heading">
                    <h3>NASA rendered visualization</h3>
                    <StatusTag tone="available">Available</StatusTag>
                  </div>
                  <p>
                    A 2048 × 1024 JPEG of frame 25000 (19 June 2007 12:00 UTC)
                    from NASA&apos;s animation, bundled locally so the interface
                    does not depend on a live request. NASA SVS content is public
                    domain unless noted; this record does not note licensed
                    music, and only the still is used.
                  </p>
                  <p className="layer-limit">
                    Color encodes temperature. The bundled frame has no embedded
                    colorbar. NASA also publishes separate colorbar frames, but a
                    rendered colorbar still does not yield validated field
                    values; those require the numerical ECCO2 data.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">03</span>
                <div>
                  <div className="layer-heading">
                    <h3>Derived or processed data</h3>
                    <StatusTag tone="neutral">None yet</StatusTag>
                  </div>
                  <p>
                    No normalization, resampling, mapping, or synthetic test
                    series has been created. When derived data exists, it will
                    carry its source record and processing steps, and synthetic
                    fixtures will be labeled as synthetic in the interface.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="prose-section" id="limits">
            <h2>What the image can and cannot tell us</h2>
            <div className="scope-columns">
              <div>
                <h3>Can show</h3>
                <ul className="marker-list">
                  <li>Spatial pattern of modeled surface current flow.</li>
                  <li>Relative warm and cool bands through color.</li>
                  <li>Where narrow currents and eddies appear.</li>
                  <li>One historical model year: 2007–2008.</li>
                </ul>
              </div>
              <div>
                <h3>Cannot show</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Exact sea surface temperature values.</li>
                  <li>Numerical velocity magnitude or direction.</li>
                  <li>Uncertainty, subsurface structure, or causality.</li>
                  <li>Live or current ocean conditions.</li>
                </ul>
              </div>
            </div>
            <p className="callout">
              <Info aria-hidden="true" size={15} strokeWidth={1.5} />
              Earth&apos;s Pulse does not sample pixel colors as measurements.
              Doing so would turn a rendering choice into invented data.
            </p>
          </section>

          <section className="prose-section" id="access">
            <h2>Access limitations and next step</h2>
            <div className="prose">
              <p>
                The rendered record is easy to use. The numerical record is not.
                ECCO2 is a legacy product; its estimation period, cube-sphere
                grid, and 50 vertical levels describe a scientific dataset far
                larger than a browser application should ingest. The current
                ECCO distribution at PO.DAAC is measured in terabytes and
                requires authentication.
              </p>
              <p>
                The smallest defensible next dataset is a single surface
                timestep containing temperature and both velocity components, on
                a regular latitude–longitude grid, subset to one region of
                interest. It should be acquired once by a server-side job,
                checksummed, and stored with its source query and units. Its
                size will be measured, not assumed.
              </p>
            </div>
            <ul className="link-list">
              <li>
                <a
                  href="https://ecco-group.org/products.htm"
                  rel="noreferrer"
                  target="_blank"
                >
                  ECCO2 legacy product description
                  <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.6} />
                </a>
                <span>Period, domain, resolution, and vertical levels.</span>
              </li>
              <li>
                <a
                  href="https://ecco-group.org/datasets.htm"
                  rel="noreferrer"
                  target="_blank"
                >
                  ECCO data at PO.DAAC
                  <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.6} />
                </a>
                <span>Current distribution; Earthdata Login required.</span>
              </li>
              <li>
                <a
                  href="https://www.earthdata.nasa.gov/"
                  rel="noreferrer"
                  target="_blank"
                >
                  NASA Earthdata
                  <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.6} />
                </a>
                <span>Account and access layer for PO.DAAC holdings.</span>
              </li>
            </ul>
            <p className="fine-print">
              The full validation log ships with the repository at{" "}
              <code>docs/DATA_SOURCE_REPORT.md</code>.
            </p>
          </section>

          <section className="prose-section" id="license">
            <h2>Licensing and attribution</h2>
            <div className="prose">
              <p>
                NASA SVS states that its content is in the public domain unless
                otherwise noted. NASA&apos;s media guidelines still govern use of
                NASA identifiers and imply no endorsement. This project uses the
                rendered still and textual attribution; it does not use the NASA
                insignia or logo.
              </p>
              <p>
                ECCO products carry a citation condition: cite the dataset and
                the associated journal reference or product synopsis. The ECCO
                consortium&apos;s requested format is recorded below. Earth&apos;s
                Pulse is independent and is not an official NASA product.
              </p>
            </div>
            <p className="license-links">
              <a
                className="text-link"
                href={NASA_SVS_RECORD.license.url}
                rel="noreferrer"
                target="_blank"
              >
                NASA media usage guidelines
                <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.6} />
              </a>
              <Link className="text-link" href="/about#credits">
                Full project credits
              </Link>
            </p>
          </section>

          <section className="prose-section" id="citation">
            <h2>Citation</h2>
            <div className="citation-block">
              <p>
                NASA Scientific Visualization Studio.{" "}
                <cite>Global Sea Surface Currents and Temperature</cite>.
                Visualization by Greg Shirah. Released 16 March 2012. Accessed
                14 November 2026.{" "}
                <a href={NASA_SVS_RECORD.pageUrl}>{NASA_SVS_RECORD.pageUrl}</a>
              </p>
              <p>
                ECCO Consortium. ECCO2 / ECCO Cube92. Dataset description
                accessed 14 November 2026.{" "}
                <a href="https://ecco-group.org/products.htm">
                  https://ecco-group.org/products.htm
                </a>
              </p>
            </div>
          </section>
        </article>

        <aside className="article-aside">
          <nav aria-label="On this page" className="article-toc">
            <p className="aside-label">On this page</p>
            {contents.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="aside-note">
            <p className="aside-label">Data status</p>
            <p>
              Rendered plate available. Numerical fields not connected. No audio
              mapping exists yet.
            </p>
            <Link className="text-link" href="/">
              Return to Explore
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
