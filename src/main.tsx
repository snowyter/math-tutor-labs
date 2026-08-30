import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

// Imported AFTER App on purpose. Component stylesheets are pulled in by App's
// own imports, and CSS is applied in load order — so responsive.css has to load
// last or the component rules override every mobile rule at equal specificity.
// Do not move this above the App import; the mobile layout silently breaks.
import './styles/responsive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
