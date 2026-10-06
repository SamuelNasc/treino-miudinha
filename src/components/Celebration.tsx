import { useMemo } from "react";
import type { WorkoutId } from "../domain/plan";
import { Berry } from "./Sprite";

export function Celebration({ workout, next, onClose }: { workout: WorkoutId; next: WorkoutId; onClose: () => void }) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fruits = useMemo(
    () =>
      Array.from({ length: 22 }, (_, k) => ({
        symbol: k % 3 ? "berry" : "cherry",
        left: Math.random() * 100,
        duration: 1.8 + Math.random() * 1.6,
        delay: Math.random() * 0.6,
      })),
    [],
  );

  return (
    <div className="party" role="dialog" aria-modal="true" aria-labelledby="party-title">
      <div className="party-card">
        <Berry fill="var(--berry)" className="hero" />
        <h2 id="party-title">Treino concluído!</h2>
        <p>
          Treino {workout} feito. Próximo: Treino {next}.
        </p>
        <button className="cta" type="button" onClick={onClose} autoFocus>
          Fechar
        </button>
      </div>
      {!reduceMotion &&
        fruits.map((f, i) => (
          <svg
            key={i}
            className="fall"
            aria-hidden="true"
            style={{ left: `${f.left}vw`, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
          >
            <use href={`#${f.symbol}`} style={{ fill: "var(--berry)" }} />
          </svg>
        ))}
    </div>
  );
}
