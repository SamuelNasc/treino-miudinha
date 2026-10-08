import type { ReminderDue, ReminderSettings } from "../domain/measurements";

export function ReminderCard({ due, onMeasure, onSnooze }: { due: NonNullable<ReminderDue>; onMeasure: () => void; onSnooze: () => void }) {
  const first = "first" in due;
  return (
    <section className="nudge" aria-label="Lembrete de medidas">
      <svg className="nudge-ico" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20 20 L31 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M8 20h4M20 8v4M20 28v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="nudge-text">
        <strong>{first ? "Hora da primeira medição" : "Hora de medir"}</strong>
        <span>{first ? "Ela vira o seu ponto de partida." : `A última com fita foi há ${due.days} dias.`}</span>
      </div>
      <div className="nudge-acts">
        <button className="cta small" type="button" onClick={onMeasure}>
          Medir agora
        </button>
        <button className="ghost" type="button" onClick={onSnooze}>
          Hoje não
        </button>
      </div>
    </section>
  );
}

const CHOICES: { everyDays: ReminderSettings["everyDays"]; label: string }[] = [
  { everyDays: 7, label: "7 dias" },
  { everyDays: 14, label: "14 dias" },
  { everyDays: 30, label: "30 dias" },
  { everyDays: null, label: "Não lembrar" },
];

export function ReminderSetting({
  everyDays,
  showing,
  onChange,
}: {
  everyDays: ReminderSettings["everyDays"];
  /** Whether Hoje shows the card right now. */
  showing: boolean;
  onChange: (everyDays: ReminderSettings["everyDays"]) => void;
}) {
  const hint =
    everyDays === null
      ? "Sem lembrete. Você mede quando quiser."
      : showing
        ? "Vai aparecer em Hoje até você medir com a fita. Só o peso não conta."
        : "Conta a partir da última medição com fita. Só o peso não conta.";
  return (
    <section className="card" aria-labelledby="reminder-title">
      <div className="sec-head">
        <h2 id="reminder-title">Lembrete</h2>
      </div>
      <div className="seg" role="group" aria-label="Lembrar a cada">
        {CHOICES.map((c) => (
          <button key={c.label} type="button" aria-pressed={c.everyDays === everyDays} onClick={() => onChange(c.everyDays)}>
            {c.label}
          </button>
        ))}
      </div>
      <p className="hint">{hint}</p>
    </section>
  );
}
