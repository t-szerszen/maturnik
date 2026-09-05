import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CurrentWeek from './views/CurrentWeek';
import Statistics from './views/Statistics';
import TemplateEditor from './views/TemplateEditor';
import DataManagement from './views/DataManagement';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CurrentWeek />} />
          <Route path="stats" element={<Statistics />} />
          <Route path="template" element={<TemplateEditor />} />
          <Route path="data" element={<DataManagement />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
