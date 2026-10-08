export type Page = "hoje" | "medidas";

/** Menu door 1: the destination is screen state in App - no URL, never stored. */
export function Menu({ page, onPage }: { page: Page; onPage: (page: Page) => void }) {
  return (
    <nav className="menu" aria-label="Menu">
      <button type="button" aria-current={page === "hoje" ? "page" : undefined} onClick={() => onPage("hoje")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Hoje
      </button>
      <button type="button" aria-current={page === "medidas" ? "page" : undefined} onClick={() => onPage("medidas")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.5" y="8" width="19" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M6 8v3.5M9.5 8v2M13 8v3.5M16.5 8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Medidas
      </button>
    </nav>
  );
}
