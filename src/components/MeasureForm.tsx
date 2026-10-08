import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Measurement, MeasureValues } from "../domain/measurements";
import { MEASURES, parseMeasure, type MeasureId } from "../domain/measures";

type Drafts = Record<MeasureId, string>;

const LABEL = Object.fromEntries(MEASURES.map((m) => [m.id, m])) as Record<MeasureId, (typeof MEASURES)[number]>;

// Where the tape goes, one line per row. The drawings come with the MeasureGuide slice.
const ROWS: { name: string; ids: MeasureId[]; cue?: string }[] = [
  { name: "Peso", ids: ["peso"] },
  { name: "Busto", ids: ["busto"], cue: "Na parte mais cheia do busto." },
  { name: "Cintura", ids: ["cintura"], cue: "Na parte mais fina, acima do umbigo." },
  { name: "Abdômen", ids: ["abdomen"], cue: "Na linha do umbigo." },
  { name: "Quadril", ids: ["quadril"], cue: "Na parte mais larga do bumbum." },
  { name: "Braço", ids: ["braco-d", "braco-e"], cue: "No meio do braço, relaxado." },
  { name: "Coxa", ids: ["coxa-d", "coxa-e"], cue: "No meio da coxa, em pé." },
  { name: "Panturrilha", ids: ["panturrilha-d", "panturrilha-e"], cue: "Na parte mais grossa da panturrilha." },
];

const show = (v: number) => String(v).replace(".", ",");

function draftsFor(measurements: Measurement[], date: string): Drafts {
  const values = measurements.find((m) => m.date === date)?.values ?? {};
  return Object.fromEntries(MEASURES.map((m) => [m.id, values[m.id] === undefined ? "" : show(values[m.id]!)])) as Drafts;
}

/** The value on the latest date before `date` that has this measure. Shown as a hint, never prefilled. */
function previous(measurements: Measurement[], id: MeasureId, date: string): string {
  const before = measurements.filter((m) => m.date < date && m.values[id] !== undefined);
  return before.length > 0 ? show(before[before.length - 1].values[id]!) : "–";
}

interface Props {
  measurements: Measurement[];
  today: string;
  /** Returns whether the Measurement was stored. */
  onSave: (date: string, values: MeasureValues) => boolean;
  /** Bumped by "Medir agora": opens the form on today, or leaves an open one as it is. */
  openRequest: number;
}

/** The form's state lives here: Medidas stays mounted while hidden, so a page switch keeps it. */
export function MeasureForm({ measurements, today, onSave, openRequest }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [drafts, setDrafts] = useState<Drafts>(() => draftsFor(measurements, today));
  const [marked, setMarked] = useState<MeasureId[]>([]);
  const [guide, setGuide] = useState<string | null>(null);

  const load = (day: string) => {
    setDate(day);
    setDrafts(draftsFor(measurements, day));
    setMarked([]);
  };

  const toggle = () => {
    if (!open) load(today);
    setGuide(null);
    setOpen(!open);
  };

  useEffect(() => {
    if (openRequest === 0 || open) return;
    load(today);
    setGuide(null);
    setOpen(true);
    // Only a new request opens the form; later renders must not reopen it.
  }, [openRequest]);

  const changeDate = (value: string) => {
    const day = value === "" || value > today ? today : value;
    if (day !== date) load(day);
  };

  const parsed = MEASURES.map((m) => [m.id, parseMeasure(m.id, drafts[m.id])] as const);
  const values = Object.fromEntries(parsed.filter(([, v]) => typeof v === "number")) as MeasureValues;
  const canSave = parsed.every(([, v]) => v !== "bad") && Object.keys(values).length > 0;

  const leave = (id: MeasureId) => {
    const bad = parseMeasure(id, drafts[id]) === "bad";
    setMarked((m) => (bad ? [...m.filter((x) => x !== id), id] : m.filter((x) => x !== id)));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave || !onSave(date, values)) return;
    setOpen(false);
    setGuide(null);
  };

  const field = (id: MeasureId, errId: string, side?: string) => {
    const m = LABEL[id];
    const bad = marked.includes(id);
    return (
      <label className={bad ? "num bad" : "num"} key={id}>
        {side && <span className="side">{side}</span>}
        <input
          id={`m-${id}`}
          inputMode="decimal"
          autoComplete="off"
          aria-label={`${m.label} em ${m.unit}`}
          aria-invalid={bad || undefined}
          aria-describedby={bad ? errId : undefined}
          placeholder={previous(measurements, id, date)}
          value={drafts[id]}
          onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
          onBlur={() => leave(id)}
        />
        <span>{m.unit}</span>
      </label>
    );
  };

  const row = ({ name, ids, cue }: (typeof ROWS)[number]) => {
    const pair = ids.length === 2;
    const isOpen = guide === name;
    const cueId = `where-${ids[0]}`;
    const errId = `err-${ids[0]}`;
    return (
      <div className={pair ? "row" : "row single"} role="group" aria-label={name} key={name}>
        {pair ? <span className="row-label">{name}</span> : <label htmlFor={`m-${ids[0]}`}>{name}</label>}
        {pair ? <div className="lr">{field(ids[0], errId, "D")}{field(ids[1], errId, "E")}</div> : field(ids[0], errId)}
        {cue && (
          <button className="where" type="button" aria-expanded={isOpen} aria-controls={cueId} onClick={() => setGuide(isOpen ? null : name)}>
            {isOpen ? "fechar" : "onde medir"}
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {cue && isOpen && (
          <div className="guide" id={cueId}>
            <p>{`${cue} Fita reta, sem apertar.`}</p>
          </div>
        )}
        {ids.some((id) => marked.includes(id)) && (
          <p className="err" id={errId}>
            Confira este valor
          </p>
        )}
      </div>
    );
  };

  const group = (label: string, rows: typeof ROWS): ReactNode[] => [
    <div className="group-label" key={label}>
      {label}
    </div>,
    ...rows.map(row),
  ];

  return (
    <section className="card" aria-labelledby="form-title">
      <div className="sec-head">
        <h2 id="form-title">Nova medição</h2>
        <button className="ghost" type="button" aria-expanded={open} aria-controls="measure-form" onClick={toggle}>
          {open ? "Fechar" : "Abrir"}
        </button>
      </div>
      {open && (
        <form className="form" id="measure-form" aria-labelledby="form-title" noValidate onSubmit={submit}>
          <div className="datefield">
            <label htmlFor="m-date">Data</label>
            <input type="date" id="m-date" max={today} value={date} onChange={(e) => changeDate(e.target.value)} />
          </div>
          {measurements.some((m) => m.date === date) && <p className="hint">Já tem medição nesse dia. O que você preencher atualiza ela.</p>}
          {row(ROWS[0])}
          {group("Tronco", ROWS.slice(1, 5))}
          {group("Braços e pernas", ROWS.slice(5))}
          <button className="cta save" type="submit" disabled={!canSave}>
            Salvar medição
          </button>
        </form>
      )}
    </section>
  );
}
