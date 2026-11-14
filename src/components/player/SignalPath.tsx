import { StatusTag, type StatusTone } from "@/components/ui/StatusTag";

interface SignalStage {
  code: string;
  label: string;
  detail: string;
  status: string;
  tone: StatusTone;
}

const SIGNAL_STAGES: readonly SignalStage[] = [
  {
    code: "01",
    label: "Numerical field",
    detail: "OSCAR surface u, v · NOAA OISST SST",
    status: "Available",
    tone: "available",
  },
  {
    code: "02",
    label: "Shared grid",
    detail: "1.5° equirectangular · missing cells preserved",
    status: "Available",
    tone: "available",
  },
  {
    code: "03",
    label: "Normalize",
    detail: "Dataset percentile ranges → [0, 1]",
    status: "Available",
    tone: "available",
  },
  {
    code: "04",
    label: "Map",
    detail: "Temperature, speed, east and north components",
    status: "Available",
    tone: "available",
  },
  {
    code: "05",
    label: "Web Audio",
    detail: "Three voices · compressor · deterministic graph",
    status: "Available",
    tone: "available",
  },
] as const;

interface SignalPathProps {
  id?: string;
  level?: 2 | 3;
}

export function SignalPath({ id = "signal-path-title", level = 2 }: SignalPathProps) {
  const Heading = level === 3 ? "h3" : "h2";

  return (
    <section aria-labelledby={id} className="rail-panel signal-panel">
      <div className="panel-head">
        <Heading className="panel-title" id={id}>
          Signal path
        </Heading>
        <span className="panel-count">05 stages live</span>
      </div>

      <ol className="signal-path">
        {SIGNAL_STAGES.map((stage) => (
          <li data-tone={stage.tone} key={stage.code}>
            <span aria-hidden="true" className="signal-node" />
            <span className="signal-code">{stage.code}</span>
            <span className="signal-body">
              <span className="signal-label">{stage.label}</span>
              <span className="signal-detail">{stage.detail}</span>
            </span>
            <StatusTag className="signal-status" tone={stage.tone}>
              {stage.status}
            </StatusTag>
          </li>
        ))}
      </ol>

      <p className="panel-footnote">
        The path is live end to end. Missing cells stay silent rather than
        becoming an invented value, and the same sample always produces the same
        audio parameters.
      </p>
    </section>
  );
}
