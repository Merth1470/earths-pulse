import { MAPPING_ROWS, describeRange } from "@/lib/audio/mapping";
import type { SonificationRanges } from "@/lib/audio/mapping";

interface ListeningMapProps {
  ranges: SonificationRanges;
}

export function ListeningMap({ ranges }: ListeningMapProps) {
  return (
    <section aria-labelledby="mapping-title" className="rail-panel mapping-panel">
      <div className="panel-head">
        <h2 className="panel-title" id="mapping-title">
          Auditory encoding
        </h2>
        <span className="panel-count">5 mappings</span>
      </div>

      <dl className="mapping-list">
        {MAPPING_ROWS.map((row) => (
          <div className="mapping-row" key={row.variable}>
            <dt>{row.variable}</dt>
            <dd>
              <span className="mapping-sound">{row.sound}</span>
              <span className="mapping-explanation">{row.explanation}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mapping-note">
        Normalization uses the dataset, not an invented scale:{" "}
        {describeRange(ranges)} These are percentile ranges from the bundled
        2012 subset.
      </p>
    </section>
  );
}
