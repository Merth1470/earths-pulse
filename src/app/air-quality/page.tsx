import type { Metadata } from "next";

import { AirInstrument } from "@/components/air/AirInstrument";

export const metadata: Metadata = {
  title: "The Sound of a City — air quality",
  description:
    "Explore 2023 hourly PM2.5, NO₂, and ground-level ozone from eight co-located US EPA ground monitors. A geographic sound map with an explicit nonvisual path.",
};

export default function AirQualityPage() {
  return (
    <div className="shell explore air-page">
      <header className="explore-head pulse-head">
        <div className="explore-head-main">
          <h1>The Sound of a City</h1>
          <p className="explore-lede">
            A city&apos;s atmosphere is a set of local measurements, not a single
            color. Choose a ground monitor, a pollutant, and an hour. The map
            places the monitor; the sound gives the concentration a distinct
            voice and the longitude a stereo position.
          </p>
          <p className="explore-status">
            <span aria-hidden="true" className="status-dot status-dot--available" />
            Hourly records · 2023 · ground monitors
          </p>
          <p className="listen-cue">
            Move west to east and listen for the stereo shift. Change the hour
            to hear the same station&apos;s atmosphere evolve.
          </p>
        </div>

        <dl className="explore-facts" aria-label="Air-quality dataset facts">
          <div>
            <dt>Period</dt>
            <dd>2023</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>EPA AQS</dd>
          </div>
          <div>
            <dt>Cities</dt>
            <dd>Eight</dd>
          </div>
        </dl>
      </header>

      <AirInstrument />

      <section aria-labelledby="air-scope-title" className="pulse-section field-section">
        <div className="section-intro">
          <h2 id="air-scope-title">What the map is, and is not</h2>
          <p>
            The map is a geographic control for monitoring stations. It is not a
            continuous pollution surface. Each marker is a real EPA site; its
            measurement belongs to that site, not to the whole city.
          </p>
        </div>

        <div className="field-notes">
          <div className="field-note">
            <h3>Ground-level</h3>
            <p>
              PM2.5, NO₂, and ozone are measured at ground monitors. They are not
              satellite-derived atmospheric columns, and a satellite column
              cannot be substituted for a station reading.
            </p>
          </div>
          <div className="field-note">
            <h3>Co-located sites</h3>
            <p>
              Each city uses one site that reports all three pollutants. This
              makes the three layers comparable at the same place and hour,
              while still leaving local siting and method differences in view.
            </p>
          </div>
          <div className="field-note">
            <h3>Hourly, with gaps</h3>
            <p>
              The record is hourly in UTC. Ozone is often monitored seasonally,
              so winter gaps are real. No hour is filled from a daily average,
              and no value is interpolated across stations.
            </p>
          </div>
          <div className="field-note">
            <h3>Not a ranking</h3>
            <p>
              The comparison view shows two monitors at the same hour. It does
              not rank cities or declare a health risk. Units and measurement
              types differ by pollutant and must stay visible.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="air-listen-title" className="pulse-section">
        <div className="section-intro">
          <h2 id="air-listen-title">How to listen to a place</h2>
          <p>
            Select a city and a day. Play the 24-hour sequence or scrub to a
            single hour. The map, reading panel, and audio all move together.
          </p>
        </div>
        <div className="scope-columns">
          <div>
            <h3>What changes the sound</h3>
            <ul className="marker-list">
              <li>Longitude moves the city left or right in the stereo field.</li>
              <li>Higher PM2.5 opens the low haze and raises its presence.</li>
              <li>Higher NO₂ quickens the reedy pulse.</li>
              <li>Higher ozone opens the bright high band.</li>
              <li>Each pollutant layer can be muted independently.</li>
            </ul>
          </div>
          <div>
            <h3>What the sound does not prove</h3>
            <ul className="marker-list marker-list--muted">
              <li>That one city is more polluted overall.</li>
              <li>That a station represents every neighborhood.</li>
              <li>That a high value is a health diagnosis or a compliance result.</li>
              <li>That a missing winter ozone hour is zero.</li>
              <li>That 2023 data describe the present.</li>
            </ul>
          </div>
        </div>
        <p className="fine-print">
          The audio is normalized by each pollutant&apos;s 2nd–98th percentile.
          The text always reports the original unit and value, including values
          beyond the audio range.
        </p>
      </section>
    </div>
  );
}
