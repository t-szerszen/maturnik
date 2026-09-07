import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store';

import Layout from './components/Layout';
import CurrentWeek from './views/CurrentWeek';
import Statistics from './views/Statistics';
import TemplateEditor from './views/TemplateEditor';
import HistoryView from './views/History';
import DataManagement from './views/DataManagement';
import AuthView from './views/Auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initFirebaseSync = useStore(s => s.initFirebaseSync);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await initFirebaseSync(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [initFirebaseSync]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Ładowanie Maturnika...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CurrentWeek />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="stats" element={<Statistics />} />
          <Route path="template" element={<TemplateEditor />} />
          <Route path="data" element={<DataManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
