import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { StatusTag } from "@/components/ui/StatusTag";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "Data Sources",
  description:
    "Provenance for Earth's Pulse: the OSCAR and NOAA OISST fields behind the sonification, the reduction pipeline, NASA SVS record 3912 as reference, and the unresolved ECCO2 numerical-data question.",
};

const contents = [
  { href: "#field", label: "Interactive field" },
  { href: "#record", label: "NASA reference" },
  { href: "#layers", label: "Evidence layers" },
  { href: "#limits", label: "Limits" },
  { href: "#access", label: "ECCO2 access" },
  { href: "#license", label: "Licensing" },
  { href: "#citation", label: "Citation" },
];

const assets = [
  {
    name: "OSCAR near-surface currents",
    role: "Numerical u, v fields",
    state: "2012 subset",
    tone: "available" as const,
    href: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar",
    linkLabel: "ERDDAP",
  },
  {
    name: "NOAA OISST v2.1",
    role: "Numerical SST field",
    state: "2012 subset",
    tone: "available" as const,
    href: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg",
    linkLabel: "ERDDAP",
  },
  {
    name: "Bundled ocean subset",
    role: "Shared 1.5° grid, twelve months",
    state: "1.75 MB",
    tone: "available" as const,
    href: "/data/ocean-2012.json",
    linkLabel: "Metadata",
  },
  {
    name: "NASA SVS record 3912",
    role: "Reference visualization and credits",
    state: "Verified",
    tone: "available" as const,
    href: NASA_SVS_RECORD.pageUrl,
    linkLabel: "Record",
  },
  {
    name: "NASA rendered still",
    role: "One frame, 19 Jun 2007",
    state: "Bundled 1.0 MB",
    tone: "available" as const,
    href: NASA_SVS_RECORD.still.src,
    linkLabel: "JPEG",
  },
  {
    name: "ECCO2 numerical fields",
    role: "Original model output",
    state: "Not obtained",
    tone: "blocked" as const,
    href: "https://ecco-group.org/datasets.htm",
    linkLabel: "Access",
  },
];

export default function DataSourcesPage() {
  return (
    <div className="shell page">
      <PageIntro
        aside={
          <>
            <span>Stage 02</span>
            <span>Source validation</span>
            <span>{NASA_SVS_RECORD.validatedOn}</span>
          </>
        }
        lede="What is measured, what is modeled, what is reduced for the browser, and what is still missing. This page separates the numerical field, the sonification, NASA's reference render, and the unresolved ECCO2 question."
        title="Data sources and provenance"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <div className="source-summary">
              <div>
                <p className="aside-label">Interactive field</p>
                <p className="source-summary-title">
                  OSCAR currents + NOAA OISST temperature
                </p>
                <p>
                  Twelve monthly composites from 2012, reduced to a public
                  1.5° global grid and bundled with the application.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Period</dt>
                  <dd className="record-mono">Jan — Dec 2012</dd>
                </div>
                <div>
                  <dt>Grid</dt>
                  <dd className="record-mono">240 × 106 cells</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd>Public · no login</dd>
                </div>
              </dl>
            </div>
            <p className="prose">
              OSCAR is a satellite-derived near-surface (15 m) current analysis from Earth
              &amp; Space Research, built from altimetry, winds, and ocean
              property fields. OISST v2.1 is a NOAA blended sea surface
              temperature analysis that combines satellite and in-situ
              observations. Both are authoritative gridded products; neither is
              a direct instrument reading at every cell.
            </p>
          </section>

          <section className="prose-section" id="field">
            <h2>The interactive field</h2>
            <p className="prose">
              The browser does not download the original archives. A reproducible
              script selects one composite near the middle of each month,
              bilinearly resamples the two products onto a shared grid, and
              preserves missing cells. It writes an Int16 binary with a JSON
              metadata sidecar.
            </p>

            <div
              aria-label="Verified assets and their status"
              className="table-wrap"
              role="region"
              tabIndex={0}
            >
              <table className="record-table" role="table">
                <caption className="sr-only">
                  Assets used or evaluated for Earth&apos;s Pulse, with their
                  role and access status.
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

            <dl className="credits-list">
              <div>
                <dt>OSCAR variables</dt>
                <dd>Near-surface zonal (u) and meridional (v) velocity, m/s, 15 m depth.</dd>
              </div>
              <div>
                <dt>OISST variable</dt>
                <dd>Daily sea surface temperature, °C, 0 m.</dd>
              </div>
              <div>
                <dt>Selected dates</dt>
                <dd>
                  Nearest OSCAR composite and OISST day to the 15th of each month,
                  2012. The exact source timestamps are stored per frame.
                </dd>
              </div>
              <div>
                <dt>Reduction</dt>
                <dd>
                  Bilinear resampling to 1.5°; Int16 quantization (0.001 m/s,
                  0.01 °C); missing sentinel −32768. No smoothing across land.
                </dd>
              </div>
              <div>
                <dt>Validation</dt>
                <dd>
                  226,464 valid SST cells spanning −1.80 to 34.14 °C; 196,404
                  valid current vectors; 98th-percentile speed 0.536 m/s.
                </dd>
              </div>
            </dl>
          </section>

          <section className="prose-section" id="record">
            <h2>NASA reference record</h2>
            <div className="source-summary">
              <div>
                <p className="aside-label">Visualization</p>
                <p className="source-summary-title">{NASA_SVS_RECORD.title}</p>
                <p>
                  NASA Scientific Visualization Studio, record{" "}
                  {NASA_SVS_RECORD.id}. Released {NASA_SVS_RECORD.releaseLabel},
                  updated 18 Feb 2025.
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
                  <dt>Plate frame</dt>
                  <dd className="record-mono">25000 · 19 Jun 2007</dd>
                </div>
              </dl>
            </div>
            <div className="prose">
              <p>
                The bundled still is one rendered frame, not a full-year
                composite and not a numerical field. NASA also publishes a
                separate with-colorbar TIFF variant, but no colorbar values were
                transcribed and a rendered colorbar would not yield validated
                field values.
              </p>
              <p>
                The reference render is displayed in a collapsed section on
                Explore. It is evidence and context; no pixel from it reaches the
                sonification engine.
              </p>
            </div>
          </section>

          <section className="prose-section" id="layers">
            <h2>Five layers of evidence</h2>
            <ol className="layer-list">
              <li>
                <span aria-hidden="true" className="layer-index">01</span>
                <div>
                  <div className="layer-heading">
                    <h3>Source products</h3>
                    <StatusTag tone="available">Available</StatusTag>
                  </div>
                  <p>
                    OSCAR near-surface (15 m) current analysis and NOAA OISST v2.1
                    temperature. These are gridded, published products with
                    documented providers and citations, accessed through public
                    NOAA CoastWatch ERDDAP.
                  </p>
                  <p className="layer-limit">
                    OSCAR combines geostrophic, Ekman, and buoyancy components;
                    OISST blends satellite and in-situ observations. Neither is
                    a direct measurement at every grid cell.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">02</span>
                <div>
                  <div className="layer-heading">
                    <h3>Reduced shared grid</h3>
                    <StatusTag tone="available">Available</StatusTag>
                  </div>
                  <p>
                    A 240 × 106 equirectangular grid covering roughly 80°S to
                    80°N, twelve monthly frames, quantized to Int16. Missing
                    source cells remain missing and are never zero-filled.
                  </p>
                  <p className="layer-limit">
                    The reduction is for browser delivery. It is a derived
                    product, not the authoritative archive; the processing steps
                    are listed in the sidecar and in the fetch script.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">03</span>
                <div>
                  <div className="layer-heading">
                    <h3>Sonification</h3>
                    <StatusTag tone="available">Available</StatusTag>
                  </div>
                  <p>
                    A deterministic Web Audio graph maps normalized temperature,
                    current speed, and velocity components to pitch, pulse rate,
                    stereo position, and pulse pitch offset. The mapping is
                    documented in the rail and in SCIENCE_AND_SONIFICATION.md.
                  </p>
                  <p className="layer-limit">
                    Sonification is an interpretation. It does not add
                    information and does not establish causation. The same
                    sample and settings always produce the same parameters.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">04</span>
                <div>
                  <div className="layer-heading">
                    <h3>NASA rendered visualization</h3>
                    <StatusTag tone="available">Reference</StatusTag>
                  </div>
                  <p>
                    A 2048 × 1024 JPEG of frame 25000 from NASA&apos;s 2007–2008
                    ECCO2 animation, bundled locally. NASA SVS content is public
                    domain unless noted; this record does not note licensed
                    music, and only the still is used.
                  </p>
                  <p className="layer-limit">
                    Color is a rendering choice. The image is not sampled for
                    measurements and is not synchronized with the interactive
                    field.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" className="layer-index">05</span>
                <div>
                  <div className="layer-heading">
                    <h3>ECCO2 numerical fields</h3>
                    <StatusTag tone="blocked">Not obtained</StatusTag>
                  </div>
                  <p>
                    The original model output behind NASA&apos;s render. The SVS
                    API publishes rendered media and metadata, not these fields.
                    Access requires a separate scientific data path.
                  </p>
                  <p className="layer-limit">
                    The legacy ECCO JPL data host was unreachable during
                    validation. PO.DAAC requires NASA Earthdata Login, and its
                    current ECCO V4r4 product is not the release used for the
                    2012 render.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="prose-section" id="limits">
            <h2>What the field can and cannot tell us</h2>
            <div className="scope-columns">
              <div>
                <h3>Can show</h3>
                <ul className="marker-list">
                  <li>Relative sea surface temperature across the sampled months.</li>
                  <li>Near-surface current direction and relative speed.</li>
                  <li>Seasonal change between twelve monthly composites.</li>
                  <li>Where the source products have no valid ocean value.</li>
                </ul>
              </div>
              <div>
                <h3>Cannot show</h3>
                <ul className="marker-list marker-list--muted">
                  <li>Daily or hourly variability within a month.</li>
                  <li>Subsurface structure or volume transport.</li>
                  <li>Uncertainty at each grid cell.</li>
                  <li>Live, forecast, or causal conditions.</li>
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
            <h2>Why ECCO2 is not the interactive field</h2>
            <div className="prose">
              <p>
                NASA&apos;s visualization references ECCO2 and MITgcm output for
                March 2007 through March 2008. That numerical record is a
                cube-sphere model archive, not a small image-adjacent file. The
                exact ECCO2 release behind the 2012 render also remains
                unresolved from public metadata.
              </p>
              <p>
                The current ECCO distribution is a separate multi-file archive and
                requires NASA Earthdata Login. Downloading a defensible subset
                from this build environment was not possible. Rather than
                fabricate ECCO2 values or claim the render is data, the project
                used two public alternatives that support the same scientific
                experience: near-surface velocity at 15 m and sea surface
                temperature, sampled globally over a full year.
              </p>
              <p>
                This is a documented substitution, not a silent one. The field is
                labeled as OSCAR + OISST throughout the interface. The ECCO2
                numerical path remains an explicit future step.
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
                OSCAR data may be used and redistributed for free but is provided
                without warranty of accuracy for legal use. Cite Bonjean and
                Lagerloef (2002). OISST is a U.S. Government work; cite Huang et
                al. (2021). NASA SVS content is public domain unless otherwise
                noted, and NASA&apos;s media guidelines still govern identifiers
                and imply no endorsement.
              </p>
              <p>
                Coastline geometry is Natural Earth 1:110m land, public domain.
                This project does not use the NASA insignia or logo and is not an
                official NASA product.
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
                Bonjean, F. and G.S.E. Lagerloef (2002). Diagnostic model and
                analysis of the surface currents in the tropical Pacific Ocean.{" "}
                <cite>Journal of Physical Oceanography</cite>, 32, 2938–2954.
              </p>
              <p>
                Huang, B., et al. (2021). Improvements of the Daily Optimum
                Interpolation Sea Surface Temperature (DOISST) Version 2.1.{" "}
                <cite>Journal of Climate</cite>, 34, 2923–2939.
              </p>
              <p>
                NASA Scientific Visualization Studio.{" "}
                <cite>Global Sea Surface Currents and Temperature</cite>.
                Visualization by Greg Shirah. Released 16 March 2012. Accessed
                14 November 2026.{" "}
                <a href={NASA_SVS_RECORD.pageUrl}>{NASA_SVS_RECORD.pageUrl}</a>
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
              Numerical field and sonification are live. ECCO2 numerical access
              remains unresolved and is labeled as such.
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
