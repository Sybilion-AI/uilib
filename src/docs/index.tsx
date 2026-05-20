import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { APP_ROOT_ID } from '#uilib/constants/appMount';
import { DEFAULT_THEME_ACTIVE_COLOR } from '#uilib/docs/lib/theme';

import App from './App/App';
import { ThemeProvider } from './contexts/theme-context';

const elem = document.getElementById(APP_ROOT_ID) as HTMLElement;
const root = createRoot(elem);

root.render(
  <BrowserRouter basename={DOCS_ROUTER_BASENAME || undefined}>
    <ThemeProvider activeColor={DEFAULT_THEME_ACTIVE_COLOR}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
);
