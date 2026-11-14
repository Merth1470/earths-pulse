export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <ellipse
        cx="16"
        cy="16"
        rx="6.25"
        ry="13.5"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.35"
      />
      <path
        d="M2.5 16h4.6l2.1-4.5 3.1 9 3.1-13.1 3.5 16.6 2.9-8h5.3"
        stroke="var(--accent-cyan)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
    </svg>
  );
}
