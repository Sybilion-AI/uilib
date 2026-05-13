import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App/App';
import { ThemeProvider } from './contexts/theme-context';

const elem = document.getElementById('app-root') as HTMLElement;
const root = createRoot(elem);

root.render(
  <BrowserRouter>
    <ThemeProvider activeColor="#">
      <App />
    </ThemeProvider>
  </BrowserRouter>,
);
