import { useState } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

export default function DataManagement() {
  const { importData, resetData } = useStore();
  const [importJson, setImportJson] = useState('');

  const handleExport = () => {
    const data = localStorage.getItem('maturnik-storage');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maturnik-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = () => {
    if (!importJson) return;
    try {
      const parsed = JSON.parse(importJson);
      // our persist middleware stores in { state: { ... } }
      if (parsed.state) {
        importData(JSON.stringify(parsed.state));
      } else {
        importData(importJson);
      }
      alert('Zaimportowano pomyślnie!');
      setImportJson('');
    } catch {
      alert('Błąd podczas importu. Upewnij się, że JSON jest poprawny.');
    }
  };

  const handleReset = () => {
    if (confirm('Czy na pewno chcesz zresetować wszystkie dane do domyślnych? Utracisz całą historię!')) {
      resetData();
      alert('Zresetowano do ustawień domyślnych.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Zarządzanie danymi</h2>
      
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Download size={20} className="text-indigo-400" /> Eksport Danych
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Pobierz pełną kopię zapasową swoich postępów, szablonów i przedmiotów w formacie JSON.
        </p>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          Eksportuj do JSON
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Upload size={20} className="text-emerald-400" /> Import Danych
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Wklej zawartość pliku JSON z kopią zapasową poniżej. Uwaga: spowoduje to nadpisanie obecnych danych!
        </p>
        <textarea 
          className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono mb-4 focus:outline-none focus:border-indigo-500/50"
          placeholder='{"state": { "sessions": [...], ... }}'
          value={importJson}
          onChange={e => setImportJson(e.target.value)}
        />
        <button 
          onClick={handleImport}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          Importuj dane
        </button>
      </div>

      <div className="bg-red-950/20 rounded-2xl p-6 border border-red-900/30">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-red-400">
          <AlertTriangle size={20} /> Niebezpieczna strefa
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Resetuje wszystkie ustawienia, przedmioty i sesje do wartości domyślnych. Zrób kopię zapasową przed tą akcją!
        </p>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RotateCcw size={16} /> Resetuj aplikację
        </button>
      </div>
    </div>
  );
}
