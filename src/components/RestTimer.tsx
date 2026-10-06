import { useEffect, useState } from "react";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function RestTimer({ seconds, onSeconds }: { seconds: 60 | 90; onSeconds: (s: 60 | 90) => void }) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  // Remaining time always comes from the end timestamp, so a locked phone catches up on return.
  useEffect(() => {
    if (endAt === null) return;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [endAt]);

  const remaining = endAt === null ? seconds : Math.max(0, Math.ceil((endAt - now) / 1000));

  useEffect(() => {
    if (endAt === null || remaining > 0) return;
    setEndAt(null);
    setFinished(true);
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // vibration is a nicety
    }
  }, [endAt, remaining]);

  const onMain = () => {
    if (endAt !== null) return setEndAt(null);
    if (finished) return setFinished(false);
    const t = Date.now();
    setNow(t);
    setEndAt(t + seconds * 1000);
  };

  const running = endAt !== null;
  const label = running ? `${fmt(remaining)} · parar` : finished ? "Bora! Próxima série" : `Descanso · ${fmt(seconds)}`;

  return (
    <div className="timer" role="group" aria-label="Descanso">
      {([60, 90] as const).map((s, i) => (
        <button
          key={s}
          className="len"
          type="button"
          aria-pressed={seconds === s}
          onClick={() => onSeconds(s)}
          style={{ order: i === 0 ? 0 : 2 }}
        >
          {s}s
        </button>
      ))}
      <button className={`go${running ? " running" : finished ? " done" : ""}`} type="button" onClick={onMain} style={{ order: 1 }}>
        {label}
      </button>
    </div>
  );
}
