import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '../frontend/src/pages/Index.jsx';
import { GroupMonthDetails } from '../frontend/src/components/GroupMonthDetails.jsx';
import { NotFound } from '../frontend/src/pages/NotFound.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/group/:groupId/months" element={<GroupMonthDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;