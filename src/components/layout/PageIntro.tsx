import type { ReactNode } from "react";

interface PageIntroProps {
  title: string;
  lede: string;
  aside?: ReactNode;
}

export function PageIntro({ title, lede, aside }: PageIntroProps) {
  return (
    <header className="page-intro">
      <div className="page-intro-main">
        <h1>{title}</h1>
        <p className="page-lede">{lede}</p>
      </div>
      {aside ? <div className="page-intro-aside">{aside}</div> : null}
    </header>
  );
}
