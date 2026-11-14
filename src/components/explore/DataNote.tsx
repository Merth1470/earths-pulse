import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

export function DataNote() {
  return (
    <section aria-labelledby="data-note-title" className="data-note">
      <Info aria-hidden="true" className="data-note-icon" size={15} strokeWidth={1.5} />
      <div>
        <h2 className="data-note-title" id="data-note-title">
          Read the plate as a rendering.
        </h2>
        <p>
          Pixel colors are not measurements. The image is NASA&apos;s rendered
          visualization; numerical ECCO2 fields are not connected in this stage.
        </p>
        <Link className="text-link" href="/data-sources">
          Data sources and provenance
          <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
        </Link>
      </div>
    </section>
  );
}
