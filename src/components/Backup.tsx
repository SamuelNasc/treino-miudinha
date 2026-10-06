import type { ChangeEvent } from "react";
import { localDate } from "../domain/dates";
import { parseRecord, type TreinoRecord } from "../domain/store";

interface BackupProps {
  record: TreinoRecord;
  onImport: (record: TreinoRecord) => void;
  onMessage: (text: string) => void;
}

/** Door 3: the backup file is the stored record verbatim. */
export function Backup({ record, onImport, onMessage }: BackupProps) {
  const exportFile = () => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treino-backup-${localDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const parsed = parseRecord(await file.text());
    input.value = "";
    if (!parsed) return onMessage("Arquivo inválido");
    if (!window.confirm("Substituir todos os dados deste aparelho pelos do backup?")) return;
    onImport(parsed);
    onMessage("Backup importado");
  };

  return (
    <div className="foot">
      <button className="ghost" type="button" onClick={exportFile}>
        Exportar backup
      </button>
      <label className="ghost">
        Importar backup
        <input className="sr-only" type="file" accept="application/json,.json" onChange={importFile} />
      </label>
    </div>
  );
}
