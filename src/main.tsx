// SPDX-License-Identifier: Apache-2.0

// Entry point of the React application, 
  // rendering the App component inside a StrictMode wrapper for highlighting potential issues in development mode.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Entry point of the React application, rendering the App component inside a StrictMode wrapper for highlighting potential issues in development mode.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
