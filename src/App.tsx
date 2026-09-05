import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-indigo-400">Maturnik</h1>
        <p className="text-slate-400">Inicjalizacja projektu zakończona sukcesem.</p>
      </div>
    </BrowserRouter>
  );
}

export default App;
