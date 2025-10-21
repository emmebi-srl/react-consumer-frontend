import './index.css';

import App from './App';

import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from './clients/query-client';
import { StrictMode } from 'react';

// get root element from the dom
const container = document.getElementById('root');
if (container == null) {
  throw new Error('[index.js] No root element');
}

const root = createRoot(container);
// render react application in root attribute
root.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="top-left" />
    <StrictMode>
      <App />
    </StrictMode>
  </QueryClientProvider>,
);
