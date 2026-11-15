import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { StatusTag } from "@/components/ui/StatusTag";
import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

export const metadata: Metadata = {
  title: "Data Sources",
  description:
    "Provenance for all three Earth's Pulse experiences: the ocean, carbon, and air-quality records, their reduction pipelines, NASA SVS record 3912 as reference, and the unresolved ECCO2 numerical-data question.",
};

const contents = [
  { href: "#ocean", label: "Ocean field" },
  { href: "#carbon", label: "Carbon cycle" },
  { href: "#air", label: "Air quality" },
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
    name: "Bundled carbon record",
    role: "66 annual global records",
    state: "1959–2024",
    tone: "available" as const,
    href: "/data/carbon-1959-2024.json",
    linkLabel: "Metadata",
  },
  {
    name: "Bundled air-quality record",
    role: "8 monitors × 8,760 hours",
    state: "2023",
    tone: "available" as const,
    href: "/data/air-quality-2023.json",
    linkLabel: "Metadata",
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
            <span>Stage 03</span>
            <span>Source validation</span>
            <span>{NASA_SVS_RECORD.validatedOn}</span>
          </>
        }
        lede="What is measured, what is modeled, what is reduced for the browser, and what is still missing. Each experience has its own period, resolution, units, and limits; none of them is a live feed."
        title="Data sources and provenance"
      />

      <div className="article-layout">
        <article className="article-body">
          <section className="prose-section">
            <div className="source-summary">
              <div>
                <p className="aside-label">Bundled records</p>
                <p className="source-summary-title">
                  Ocean · carbon · air quality
                </p>
                <p>
                  Three separate products with different periods and resolutions,
                  reduced to small public bundles and shipped with the app.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Ocean</dt>
                  <dd className="record-mono">12 months · 2012</dd>
                </div>
                <div>
                  <dt>Carbon</dt>
                  <dd className="record-mono">66 years · 1959–2024</dd>
                </div>
                <div>
                  <dt>Air</dt>
                  <dd className="record-mono">8 × 8,760 hours · 2023</dd>
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

          <section className="prose-section" id="ocean">
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

          <section className="prose-section" id="carbon">
            <h2>The carbon cycle</h2>
            <div className="source-summary">
              <div>
                <p className="aside-label">Annual global record</p>
                <p className="source-summary-title">
                  NOAA Mauna Loa CO₂ + Global Carbon Budget 2025
                </p>
                <p>
                  Concentration and annual flows are kept separate. The first is
                  a measured state at one benchmark station; the others are
                  global budget estimates.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Period</dt>
                  <dd className="record-mono">1959 — 2024</dd>
                </div>
                <div>
                  <dt>Records</dt>
                  <dd className="record-mono">66 annual</dd>
                </div>
                <div>
                  <dt>Bundle</dt>
                  <dd className="record-mono">10.2 KB JSON</dd>
                </div>
              </dl>
            </div>
            <p className="prose">
              The atmospheric series is the NOAA Global Monitoring Laboratory
              annual mean CO₂ mixing ratio at Mauna Loa, Hawaii, in parts per
              million. The budget series is the global summary of the Global
              Carbon Budget 2025, in gigatonnes of carbon per year. The bundled
              record is the intersection of the two series, so every year has
              both a concentration and a complete budget.
            </p>
            <dl className="credits-list">
              <div>
                <dt>Concentration</dt>
                <dd>
                  NOAA GML Mauna Loa annual mean CO₂, ppm. One benchmark station,
                  not a global spatial mean.
                </dd>
              </div>
              <div>
                <dt>Fossil emissions</dt>
                <dd>
                  Fossil-fuel and industrial emissions, GtC/yr. Reported
                  separately from land-use change.
                </dd>
              </div>
              <div>
                <dt>Land-use emissions</dt>
                <dd>
                  Land-use change emissions, GtC/yr, averaged across bookkeeping
                  models.
                </dd>
              </div>
              <div>
                <dt>Sinks</dt>
                <dd>
                  Ocean and land sinks, GtC/yr. Positive means a net transfer from
                  the atmosphere into that reservoir.
                </dd>
              </div>
              <div>
                <dt>Residual</dt>
                <dd>
                  Emissions minus atmospheric growth, ocean sink, land sink, and
                  cement carbonation. A measure of budget imperfection, not a
                  physical flux.
                </dd>
              </div>
              <div>
                <dt>Validation</dt>
                <dd>
                  66 records; CO₂ 315.98–424.61 ppm; total emissions 4.61–11.79
                  GtC/yr; ocean sink 1.02–3.39 GtC/yr. The 2024 values are
                  424.61 ppm and 11.79 GtC/yr.
                </dd>
              </div>
              <div>
                <dt>Not stored</dt>
                <dd>
                  Ocean, land, or geological carbon stocks; national inventories;
                  monthly or gridded values; any interpolated year.
                </dd>
              </div>
            </dl>
            <p className="fine-print">
              Source DOI: 10.18160/gcp-2025. The NOAA annual mean is public data;
              the Global Carbon Budget is a collaborative scientific assessment.
              Neither is a live measurement. The openclimatedata CSV mirror is
              used only to make the build reproducible.
            </p>
          </section>

          <section className="prose-section" id="air">
            <h2>City air quality</h2>
            <div className="source-summary">
              <div>
                <p className="aside-label">Hourly ground monitors</p>
                <p className="source-summary-title">US EPA AirData 2023</p>
                <p>
                  Eight cities, one co-located monitor per city, three pollutants
                  at the same site and hour. This is a station record, not a
                  continuous map.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Period</dt>
                  <dd className="record-mono">2023 · hourly UTC</dd>
                </div>
                <div>
                  <dt>Sites</dt>
                  <dd className="record-mono">8 monitors</dd>
                </div>
                <div>
                  <dt>Bundle</dt>
                  <dd className="record-mono">0.93 MB JSON</dd>
                </div>
              </dl>
            </div>
            <p className="prose">
              PM2.5, NO₂, and ground-level ozone come from the EPA AirData
              pre-generated hourly files for parameter codes 88101, 42602, and
              44201. Each city uses one site that reports all three pollutants;
              the site, state/county/site identifier, latitude, longitude, and
              pollutant-specific POC are stored with the record.
            </p>
            <dl className="credits-list">
              <div>
                <dt>PM2.5</dt>
                <dd>
                  Fine particulate mass concentration, µg/m³. 69,074 valid
                  city-hours; reported range −9 to 1,069 µg/m³; 98th percentile
                  31.9.
                </dd>
              </div>
              <div>
                <dt>NO₂</dt>
                <dd>
                  Nitrogen dioxide mixing ratio, ppb. 66,135 valid city-hours;
                  reported range −2.5 to 70.4 ppb; 98th percentile 39.4.
                </dd>
              </div>
              <div>
                <dt>Ozone</dt>
                <dd>
                  Ground-level ozone mixing ratio, ppm. 65,043 valid city-hours;
                  reported range −0.001 to 0.136 ppm; 98th percentile 0.066.
                </dd>
              </div>
              <div>
                <dt>Resolution</dt>
                <dd>
                  One value per hour per city, 8,760 hours in UTC. Nulls are
                  preserved; no hour is interpolated from a daily average or a
                  neighbouring station.
                </dd>
              </div>
              <div>
                <dt>Negative values</dt>
                <dd>
                  A few reported values are slightly below zero. They are
                  preserved as reported instrument noise or zero drift, not
                  silently replaced with zero.
                </dd>
              </div>
              <div>
                <dt>Not claimed</dt>
                <dd>
                  A city-wide average, a satellite column, live air quality, a
                  health warning, a source attribution, or a compliance finding.
                </dd>
              </div>
            </dl>
            <p className="fine-print">
              The map is a geographic control for the monitors. Marker size and
              stereo position are derived from the same station value; no
              surface is interpolated between sites. Ozone is often monitored
              seasonally, so winter gaps are expected.
            </p>
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
