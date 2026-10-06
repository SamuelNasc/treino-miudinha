import { useEffect, useState } from "react";
import { loadRecord, saveRecord, type TreinoRecord } from "./domain/store";

/**
 * The stored record as React state, written back on every change. When storage cannot be read
 * the app runs in memory only and never writes, so it cannot clobber data it failed to load.
 */
export function useRecord(today: string) {
  const [loaded] = useState(() => loadRecord(today));
  const [record, setRecord] = useState<TreinoRecord>(loaded.record);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (loaded.persistent && !saveRecord(record)) setSaveFailed(true);
  }, [loaded.persistent, record]);

  return { record, setRecord, notSaving: !loaded.persistent || saveFailed };
}
