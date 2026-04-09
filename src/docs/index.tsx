import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App/App';

const elem = document.getElementById('app-root') as HTMLElement;
const root = createRoot(elem);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
