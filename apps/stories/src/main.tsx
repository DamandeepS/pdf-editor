import React from 'react';
import ReactDOM from 'react-dom/client';
import '@inq/tokens/dist/tokens.css';
import '@inq/ui/styles.css';
import './App.css';
import { WorkbenchProvider } from './context/WorkbenchContext';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkbenchProvider>
      <App />
    </WorkbenchProvider>
  </React.StrictMode>
);
