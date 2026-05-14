import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { DEFAULT_THEME_ACTIVE_COLOR } from '#uilib/docs/lib/theme';

import App from './App/App';
import { ThemeProvider } from './contexts/theme-context';

const elem = document.getElementById('app-root') as HTMLElement;
const root = createRoot(elem);

root.render(
  <BrowserRouter>
    <ThemeProvider activeColor={DEFAULT_THEME_ACTIVE_COLOR}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
);
