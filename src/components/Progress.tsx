import { useState } from "react";
import type { WorkoutId } from "../domain/plan";
import type { StripDay } from "../domain/progress";
import { DeleteConfirm } from "./History";
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

/** "qua, 07/10" */
const dayName = (d: StripDay) => `${d.label.toLowerCase()}, ${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`;

/** Which day is asking is screen state only: App remounts the strip when the day changes. */
export function WeekStrip({ days, onRemove }: { days: StripDay[]; onRemove: (date: string, workout: WorkoutId) => void }) {
  const [asking, setAsking] = useState<string | null>(null);
  const askingDay = days.find((d) => d.date === asking && d.letters.length);
  return (
    <>
      <ul className="strip" aria-label="Semana">
        {days.map((d) => {
          const face = (
            <>
              <span className="dot" data-testid="day-dot">
                {d.letters.join("")}
              </span>
              <span data-testid="day-label">{d.label}</span>
            </>
          );
          return (
            <li
              key={d.date}
              className={["day", d.letters.length ? "done" : "", d.isToday ? "today" : "", d.isFuture ? "future" : ""].join(" ")}
              aria-current={d.isToday ? "date" : undefined}
              data-future={d.isFuture ? "true" : "false"}
            >
              {d.letters.length ? (
                <button type="button" aria-label={`Apagar treino de ${dayName(d)}`} onClick={() => setAsking((a) => (a === d.date ? null : d.date))}>
                  {face}
                </button>
              ) : (
                face
              )}
            </li>
          );
        })}
      </ul>
      {askingDay && (
        <div className="strip-confirm">
          {askingDay.letters.map((w) => (
            <DeleteConfirm
              key={w}
              question={`Apagar o Treino ${w} de ${dayName(askingDay)}?`}
              onYes={() => {
                setAsking(null);
                onRemove(askingDay.date, w);
              }}
              onNo={() => setAsking(null)}
            />
          ))}
        </div>
      )}
    </>
  );
}
