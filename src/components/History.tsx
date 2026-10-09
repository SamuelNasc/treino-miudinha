import { useState } from "react";
import type { Measurement } from "../domain/measurements";
import { MEASURES } from "../domain/measures";

const show = (v: number) => String(v).replace(".", ",");

/** `dd/mm`, plus `/aa` when the entry is from another year than today. */
export function shortDate(date: string, today: string): string {
  const dm = `${date.slice(8, 10)}/${date.slice(5, 7)}`;
  return date.slice(0, 4) === today.slice(0, 4) ? dm : `${dm}/${date.slice(2, 4)}`;
}

function summary(m: Measurement): string {
  const ids = Object.keys(m.values);
  if (ids.length === 1 && m.values.peso !== undefined) return `só peso · ${show(m.values.peso)} kg`;
  return `${ids.length} ${ids.length === 1 ? "medida" : "medidas"}`;
}

const chevron = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function DeleteConfirm({ label, onYes, onNo }: { label: string; onYes: () => void; onNo: () => void }) {
  const question = `Apagar a medição de ${label}?`;
  return (
    <div className="confirm" role="group" aria-label={question}>
      <span>{question}</span>
      <button className="danger" type="button" onClick={onYes}>
        Apagar
      </button>
      <button className="ghost" type="button" onClick={onNo}>
        Cancelar
      </button>
    </div>
  );
}

interface Props {
  measurements: Measurement[];
  today: string;
  onFirst: () => void;
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
}

export function History({ measurements, today, onFirst, onEdit, onDelete }: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const rows = [...measurements].reverse();

  const toggle = (date: string) => {
    setOpenRow(openRow === date ? null : date);
    setAsking(null);
  };

  return (
    <section className="card" aria-labelledby="hist-title">
      <div className="sec-head">
        <h2 id="hist-title">Histórico</h2>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <p>Nenhuma medição ainda.</p>
          <button className="cta small" type="button" onClick={onFirst}>
            Fazer a primeira
          </button>
        </div>
      ) : (
        <ul className="hist" aria-label="Medições">
          {rows.map((m) => {
            const open = openRow === m.date;
            const label = shortDate(m.date, today);
            return (
              <li key={m.date}>
                <button className="row-head" type="button" aria-expanded={open} onClick={() => toggle(m.date)}>
                  <span className="d" data-testid="hist-date">
                    {label}
                  </span>
                  <span className="sum" data-testid="hist-sum">
                    {summary(m)}
                  </span>
                  {chevron}
                </button>
                {open && (
                  <>
                    <dl className="vals">
                      {MEASURES.filter((x) => m.values[x.id] !== undefined).map((x) => (
                        <div key={x.id}>
                          <dt>{x.label}</dt>
                          <dd>{`${show(m.values[x.id]!)} ${x.unit}`}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="acts">
                      <button type="button" onClick={() => onEdit(m.date)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => setAsking(m.date)}>
                        Apagar
                      </button>
                    </div>
                    {asking === m.date && (
                      <DeleteConfirm
                        label={label}
                        onYes={() => {
                          setOpenRow(null);
                          setAsking(null);
                          onDelete(m.date);
                        }}
                        onNo={() => setAsking(null)}
                      />
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
