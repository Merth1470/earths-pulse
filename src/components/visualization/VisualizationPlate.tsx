"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { NASA_SVS_RECORD } from "@/lib/nasa/sources";

type PlateStatus = "loading" | "ready" | "error";

export function VisualizationPlate() {
  const [status, setStatus] = useState<PlateStatus>("loading");
  const imageRef = useRef<HTMLImageElement>(null);
  const { still } = NASA_SVS_RECORD;

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) {
      return;
    }
    setStatus(image.naturalWidth > 0 ? "ready" : "error");
  }, []);

  return (
    <figure className="plate" data-status={status}>
      <div className="plate-bar">
        <span className="plate-index">Plate 01 / Global</span>
        <span className="plate-kind">Rendered visualization · not live</span>
        <span className="plate-dims">
          {still.width} × {still.height}
        </span>
      </div>

      <div className="plate-viewport">
        <Image
          ref={imageRef}
          alt={still.alt}
          className="plate-image"
          height={still.height}
          onError={() => setStatus("error")}
          onLoad={() => setStatus("ready")}
          priority
          sizes="(min-width: 1180px) 68vw, 100vw"
          src={still.src}
          width={still.width}
        />

        {status === "loading" ? (
          <div className="plate-overlay">
            <span className="plate-overlay-kicker">NASA SVS / 3912</span>
            <span className="plate-overlay-title">Loading rendered plate</span>
            <span aria-hidden="true" className="plate-progress">
              <span />
            </span>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="plate-overlay plate-overlay--error">
            <ImageOff aria-hidden="true" size={20} strokeWidth={1.5} />
            <span className="plate-overlay-title">Rendered plate unavailable</span>
            <p>
              The local NASA still could not be loaded. The source record is
              still available.
            </p>
            <a
              className="text-link"
              href={NASA_SVS_RECORD.pageUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open NASA SVS 3912
            </a>
          </div>
        ) : null}

        <span aria-hidden="true" className="plate-tick plate-tick--tl" />
        <span aria-hidden="true" className="plate-tick plate-tick--tr" />
        <span aria-hidden="true" className="plate-tick plate-tick--bl" />
        <span aria-hidden="true" className="plate-tick plate-tick--br" />
      </div>

      <figcaption className="plate-caption">
        <span className="plate-caption-text" id="plate-caption">
          {still.caption}
        </span>
        <span className="plate-caption-source" id="plate-source">
          {still.credit}
        </span>
      </figcaption>

      <p className="sr-only" role="status">
        {status === "loading"
          ? "Loading the NASA rendered visualization."
          : status === "error"
            ? "The NASA rendered visualization could not be loaded."
            : "NASA rendered visualization loaded."}
      </p>
    </figure>
  );
}
