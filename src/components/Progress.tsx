import type { StripDay } from "../domain/progress";
import { Berry, Cherry } from "./Sprite";

export function StreakCard({ weeks, thisWeek, empty }: { weeks: number; thisWeek: number; empty: boolean }) {
  return (
    <section className="streak" aria-label="Sequência">
      <div>
        <div className="big">
          <span data-testid="streak-number">{weeks}</span> {weeks === 1 ? "semana" : "semanas"}
        </div>
        <div className="label">{empty ? "Comece hoje 💪" : "seguidas treinando 3+ vezes"}</div>
      </div>
      <Berry fill="#fff" className="hero-berry" />
      <div className="week">
        <span>Esta semana: {thisWeek}/4</span>
        <span className="cherries">
          {[0, 1, 2, 3].map((i) => (
            <Cherry key={i} fill={i < thisWeek ? "#fff" : "rgba(255,255,255,.3)"} />
          ))}
        </span>
      </div>
    </section>
  );
}

export function WeekStrip({ days }: { days: StripDay[] }) {
  return (
    <ul className="strip" aria-label="Semana">
      {days.map((d) => (
        <li
          key={d.date}
          className={["day", d.letters.length ? "done" : "", d.isToday ? "today" : "", d.isFuture ? "future" : ""].join(" ")}
          aria-current={d.isToday ? "date" : undefined}
          data-future={d.isFuture ? "true" : "false"}
        >
          <span className="dot" data-testid="day-dot">
            {d.letters.join("")}
          </span>
          <span data-testid="day-label">{d.label}</span>
        </li>
      ))}
    </ul>
  );
}
