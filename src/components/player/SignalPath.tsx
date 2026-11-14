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
    detail: "ECCO2 surface u, v, SST",
    status: "Not connected",
    tone: "blocked",
  },
  {
    code: "02",
    label: "Normalize",
    detail: "Physical units → verified [0, 1] range",
    status: "Pending",
    tone: "pending",
  },
  {
    code: "03",
    label: "Map",
    detail: "Value → pitch, timbre, pan",
    status: "Pending",
    tone: "pending",
  },
  {
    code: "04",
    label: "Audio graph",
    detail: "Web Audio synthesis",
    status: "Not implemented",
    tone: "neutral",
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
        <span className="panel-count">04 stages</span>
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
        The path stops at the field boundary. No scientific value reaches the
        audio layer in this stage.
      </p>
    </section>
  );
}
