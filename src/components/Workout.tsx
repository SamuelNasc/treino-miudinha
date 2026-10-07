import { useEffect, useState } from "react";
import { GUIDES } from "../domain/guides";
import { PLAN, WORKOUT_IDS, type Workout, type WorkoutId } from "../domain/plan";
import { parseWeight } from "../domain/store";
import { Guide } from "./GuideDrawing";
import { Berry } from "./Sprite";

export function Picker({ shown, next, onPick }: { shown: WorkoutId | null; next: WorkoutId; onPick: (id: WorkoutId) => void }) {
  return (
    <div className="picker" role="group" aria-label="Escolher treino">
      {WORKOUT_IDS.map((id) => (
        <button key={id} className="pick" type="button" aria-label={`Treino ${id}`} aria-pressed={id === shown} onClick={() => onPick(id)}>
          <b>{id}</b>
          <small>{id === next ? "próximo" : PLAN[id].focus.split(" · ")[0]}</small>
        </button>
      ))}
    </div>
  );
}

interface WorkoutCardProps {
  workout: Workout;
  checked: string[];
  weights: Record<string, number>;
  onToggle: (exerciseId: string) => void;
  onWeight: (exerciseId: string, value: number | undefined) => void;
}

/** Which guide is open is screen state only: App remounts the card when the workout or the day changes. */
export function WorkoutCard({ workout, checked, weights, onToggle, onWeight }: WorkoutCardProps) {
  const [open, setOpen] = useState<string | null>(null);
  const done = workout.exercises.filter((e) => checked.includes(e.id)).length;
  return (
    <section className="card" aria-live="polite">
      <div className="card-head">
        <div>
          <h2>Treino {workout.id}</h2>
          <p>{workout.focus}</p>
        </div>
        <div className="count">
          {done}/{workout.exercises.length}
        </div>
      </div>
      <div className="ripen" aria-hidden="true">
        {workout.exercises.map((e, i) => (
          <Berry key={e.id} className={i < done ? "ripe" : ""} fill={i < done ? "var(--berry)" : "var(--unripe)"} />
        ))}
      </div>
      <ul className="list" aria-label="Exercícios">
        {workout.exercises.map((e) => {
          const on = checked.includes(e.id);
          const guide = GUIDES[e.id];
          const isOpen = open === e.id;
          const howId = `how-${workout.id}-${e.id}`;
          return (
            <li key={e.id} className={on ? "ex on" : "ex"}>
              <button className="check" type="button" aria-pressed={on} aria-label={`Marcar ${e.name}`} onClick={() => onToggle(e.id)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {guide ? (
                <button className="name" type="button" aria-expanded={isOpen} aria-controls={howId} onClick={() => setOpen(isOpen ? null : e.id)}>
                  <strong data-testid="ex-name">{e.name}</strong>{" "}
                  <span className="sets">
                    <span data-testid="ex-sets">{e.sets}</span>{" "}
                    <span className="peek">
                      {isOpen ? "fechar" : "como faz"}
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </button>
              ) : (
                <div className="name">
                  <strong data-testid="ex-name">{e.name}</strong>
                  <span className="sets" data-testid="ex-sets">
                    {e.sets}
                  </span>
                </div>
              )}
              <WeightField name={e.name} value={weights[e.id]} onCommit={(v) => onWeight(e.id, v)} />
              {guide && isOpen && <Guide guide={guide} name={e.name} id={howId} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const show = (v: number | undefined) => (v === undefined ? "" : String(v).replace(".", ","));

function WeightField({ name, value, onCommit }: { name: string; value: number | undefined; onCommit: (v: number | undefined) => void }) {
  const [draft, setDraft] = useState(show(value));
  useEffect(() => setDraft(show(value)), [value]);

  const commit = () => {
    const parsed = parseWeight(draft, value);
    setDraft(show(parsed));
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <label className="kg">
      <input
        inputMode="decimal"
        enterKeyHint="done"
        placeholder="–"
        aria-label={`Carga de ${name} em kg`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <span>kg</span>
    </label>
  );
}

export function DoneCard({ done, next }: { done: WorkoutId[]; next: WorkoutId }) {
  return (
    <section className="card state-card">
      <Berry fill="var(--berry)" className="state-icon" />
      <h2>Feito por hoje!</h2>
      <p>
        {done.map((id) => `Treino ${id}`).join(" e ")} {done.length > 1 ? "concluídos" : "concluído"}.
      </p>
      <p className="next">Próximo: Treino {next}</p>
    </section>
  );
}

export function RestCard({ next, onTrain }: { next: WorkoutId; onTrain: () => void }) {
  return (
    <section className="card state-card">
      <Berry fill="var(--unripe)" className="state-icon" />
      <h2>Hoje é descanso</h2>
      <p>O próximo é o Treino {next}. Descansar também faz parte.</p>
      <button className="cta" type="button" onClick={onTrain}>
        Treinar mesmo assim
      </button>
    </section>
  );
}
