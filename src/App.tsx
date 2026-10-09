import { useEffect, useState } from "react";
import { Backup } from "./components/Backup";
import { Celebration } from "./components/Celebration";
import { MeasureForm } from "./components/MeasureForm";
import { History } from "./components/History";
import { Menu, type Page } from "./components/Menu";
import { ReminderCard, ReminderSetting } from "./components/Reminder";
import { StreakCard, WeekStrip } from "./components/Progress";
import { RestTimer } from "./components/RestTimer";
import { Cherry, Sprite } from "./components/Sprite";
import { DoneCard, Picker, RestCard, WorkoutCard } from "./components/Workout";
import { localDate } from "./domain/dates";
import { deleteMeasurement, editMeasurement, measurementsOf, reminderDue, reminderOf, saveMeasurement, type MeasureValues, type ReminderSettings } from "./domain/measurements";
import { PLAN, type WorkoutId } from "./domain/plan";
import { streak, weekCount, weekStrip } from "./domain/progress";
import { isRestDay, nextWorkout } from "./domain/rotation";
import { addCompletion, rollOver, toggleCheck } from "./domain/store";
import { useRecord } from "./useRecord";

export default function App() {
  const [today, setToday] = useState(() => localDate());
  const { record, setRecord, notSaving } = useRecord(today);
  const [override, setOverride] = useState<WorkoutId | null>(null);
  const [celebrating, setCelebrating] = useState<WorkoutId | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [page, setPage] = useState<Page>("hoje");
  const [measureRequest, setMeasureRequest] = useState(0);
  const [editRequest, setEditRequest] = useState<{ date: string; n: number } | null>(null);

  // A home-screen app can be resumed the next morning without a reload.
  useEffect(() => {
    const onVisible = () => {
      const now = localDate();
      if (document.visibilityState !== "visible" || now === today) return;
      setToday(now);
      setRecord((r) => rollOver(r, now));
      setOverride(null);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [today, setRecord]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const next = nextWorkout(record.completions);
  const doneToday = record.completions.filter((c) => c.date === today).map((c) => c.workout);
  const inProgress = record.today.checked.length > 0 ? record.today.workout : null;
  const shown: WorkoutId | null = override ?? (doneToday.length ? null : (inProgress ?? (isRestDay(today) ? null : next)));

  const toggle = (workout: WorkoutId, exerciseId: string) => {
    const toggled = toggleCheck(record, workout, exerciseId);
    const complete = PLAN[workout].exercises.every((e) => toggled.today.checked.includes(e.id));
    const already = record.completions.some((c) => c.date === today && c.workout === workout);
    if (complete && !already) {
      setRecord(addCompletion(toggled, today, workout));
      setOverride(null);
      setCelebrating(workout);
    } else {
      setRecord(toggled);
    }
  };

  const setWeight = (exerciseId: string, value: number | undefined) =>
    setRecord((r) => {
      const weights = { ...r.weights };
      if (value === undefined) delete weights[exerciseId];
      else weights[exerciseId] = value;
      return { ...r, weights };
    });

  const saveMeasure = (date: string, values: MeasureValues) => {
    const result = saveMeasurement(record, date, values, today);
    if (!result.ok) return false;
    setRecord(result.record);
    setToast({ text: "Medição salva", id: Date.now() });
    return true;
  };

  const editMeasure = (date: string, values: MeasureValues) => {
    const result = editMeasurement(record, date, values);
    if (!result.ok) return false;
    setRecord(result.record);
    setToast({ text: "Medição atualizada", id: Date.now() });
    return true;
  };

  const removeMeasure = (date: string) => {
    setRecord((r) => deleteMeasurement(r, date));
    setToast({ text: "Medição apagada", id: Date.now() });
  };

  const showForm = () => document.getElementById("measure-card")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const due = reminderDue(record, today);
  const setReminder = (change: Partial<ReminderSettings>) =>
    setRecord((r) => ({ ...r, reminder: { ...reminderOf(r), ...change } }));

  const snooze = () => {
    setReminder({ snoozedOn: today });
    setToast({ text: "Tudo bem, lembro amanhã", id: Date.now() });
  };

  const measureNow = () => {
    goTo("medidas");
    setMeasureRequest((n) => n + 1);
  };

  const goTo = (to: Page) => {
    if (to === page) return;
    setPage(to);
    window.scrollTo(0, 0);
  };

  const dateLabel = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });

  return (
    <>
      <Sprite />
      <main className="app">
        <header className="top">
          <div className="brand">
            <Cherry fill="var(--berry)" className="logo" />
            <div>
              <h1>
                Treino <span className="sub">Miudinha</span>
              </h1>
              <div className="date">{dateLabel}</div>
            </div>
          </div>
        </header>

        {notSaving && (
          <p className="warn" role="alert">
            Seus dados não estão sendo salvos neste navegador
          </p>
        )}

        <Menu page={page} onPage={goTo} />

        <div className="page" hidden={page !== "hoje"}>
          {due && <ReminderCard due={due} onMeasure={measureNow} onSnooze={snooze} />}
          <StreakCard
            weeks={streak(record.completions, today)}
            thisWeek={weekCount(record.completions, today)}
            empty={record.completions.length === 0}
          />
          <WeekStrip days={weekStrip(record.completions, today)} />
          <Picker shown={shown} next={next} onPick={setOverride} />

          {shown ? (
            <WorkoutCard
              key={`${today}-${shown}`}
              workout={PLAN[shown]}
              checked={record.today.workout === shown ? record.today.checked : []}
              weights={record.weights}
              onToggle={(id) => toggle(shown, id)}
              onWeight={setWeight}
            />
          ) : doneToday.length ? (
            <DoneCard done={doneToday} next={next} />
          ) : (
            <RestCard next={next} onTrain={() => setOverride(next)} />
          )}

          <Backup
            record={record}
            onImport={(r) => {
              setRecord(rollOver(r, today));
              setOverride(null);
            }}
            onMessage={(text) => setToast({ text, id: Date.now() })}
          />
        </div>

        <section className="page" aria-label="Medidas" hidden={page !== "medidas"}>
          <MeasureForm
            measurements={measurementsOf(record)}
            today={today}
            onSave={saveMeasure}
            openRequest={measureRequest}
            editRequest={editRequest}
            onEdit={editMeasure}
            onDelete={removeMeasure}
          />
          <History
            measurements={measurementsOf(record)}
            today={today}
            onFirst={() => {
              setMeasureRequest((n) => n + 1);
              showForm();
            }}
            onEdit={(date) => {
              setEditRequest((r) => ({ date, n: (r?.n ?? 0) + 1 }));
              showForm();
            }}
            onDelete={removeMeasure}
          />
          <ReminderSetting everyDays={reminderOf(record).everyDays} showing={due !== null} onChange={(everyDays) => setReminder({ everyDays })} />
        </section>
      </main>

      <RestTimer seconds={record.restSeconds} onSeconds={(s) => setRecord((r) => ({ ...r, restSeconds: s }))} />

      {toast && (
        <div className="toast" role="status" key={toast.id}>
          {toast.text}
        </div>
      )}

      {celebrating && <Celebration workout={celebrating} next={next} onClose={() => setCelebrating(null)} />}
    </>
  );
}
