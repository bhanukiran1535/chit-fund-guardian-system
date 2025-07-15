import { createRoot } from 'react-dom/client';
import App from '../frontend/src/App.jsx';
import '../frontend/src/index.css';

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}