import Link from "next/link";

import { VoiceGuide } from "@/components/accessibility/VoiceGuide";

import { LogoMark } from "./LogoMark";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link aria-label="Earth's Pulse home" className="brand" href="/">
          <LogoMark className="brand-mark" />
          <span className="brand-lockup">
            <span className="brand-name">Earth’s Pulse</span>
            <span className="brand-sub">Sonification interface</span>
          </span>
        </Link>

        <SiteNav />

        <VoiceGuide />

        <Link
          aria-label="Stage 3, three scientific experiences active. View data status."
          className="header-stage"
          href="/data-sources"
        >
          <span aria-hidden="true" className="status-dot status-dot--available" />
          <span>Stage 03</span>
          <span className="header-stage-mode"> / Three instruments</span>
        </Link>
      </div>
    </header>
  );
}
