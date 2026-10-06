/** Strawberry and cherry symbols, referenced with <use href="#berry"> / <use href="#cherry">. */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="berry" viewBox="0 0 32 32">
          <path d="M16 9c6 0 11 2.5 11 7.5C27 23 20.5 29 16 30 11.5 29 5 23 5 16.5 5 11.5 10 9 16 9z" />
          <g fill="#fff6c8" opacity=".9">
            <ellipse cx="11" cy="15" rx=".9" ry="1.3" />
            <ellipse cx="16" cy="14" rx=".9" ry="1.3" />
            <ellipse cx="21" cy="15" rx=".9" ry="1.3" />
            <ellipse cx="13" cy="20" rx=".9" ry="1.3" />
            <ellipse cx="19" cy="20" rx=".9" ry="1.3" />
            <ellipse cx="16" cy="25" rx=".9" ry="1.3" />
          </g>
          <path
            fill="var(--leaf)"
            d="M16 4.5c.8 1.8.9 3 .6 4.5 2-1.4 4.6-1.6 7-.6-2 1.6-4.3 2.4-7 2.3 1 1.4 1.2 2.6.6 3.7-1.3-.7-2.4-1.6-3.1-3-1.4 1-3 1.5-5.4 1.2 1.4-1.6 3-2.6 4.7-3.1-1.9-.6-3.2-1.7-4-3.3 2.2-.2 3.9.2 5.3 1.2.1-1.2.5-2.1 1.3-2.9z"
          />
        </symbol>
        <symbol id="cherry" viewBox="0 0 32 32">
          <path d="M17 3c-1 6-5 10-8 15M17 3c1.5 6 4.5 9.5 7 13" fill="none" stroke="var(--leaf)" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 3c3-1.5 6-1 8 1-3 1.2-5.5 1-8-1z" fill="var(--leaf)" />
          <circle cx="9" cy="22" r="6.5" />
          <circle cx="23.5" cy="21" r="6.5" />
          <circle cx="7" cy="20" r="1.6" fill="#fff" opacity=".55" />
          <circle cx="21.5" cy="19" r="1.6" fill="#fff" opacity=".55" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Berry({ fill, className }: { fill: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href="#berry" style={{ fill }} />
    </svg>
  );
}

export function Cherry({ fill, className }: { fill: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href="#cherry" style={{ fill }} />
    </svg>
  );
}
