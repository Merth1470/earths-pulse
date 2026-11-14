import type { ReactNode } from "react";

export type StatusTone = "available" | "blocked" | "pending" | "neutral";

interface StatusTagProps {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}

export function StatusTag({ tone, children, className }: StatusTagProps) {
  return (
    <span className={["status-tag", `status-tag--${tone}`, className].filter(Boolean).join(" ")}>
      <span aria-hidden="true" className={`status-dot status-dot--${tone}`} />
      {children}
    </span>
  );
}
