import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import LinearProgress from '@mui/material/LinearProgress';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Larger pages are loaded when first opened, so the first visit downloads only what it shows.
// The rates page carries the chart library.
const RatesPage = lazy(() => import('./pages/rates/RatesPage').then((m) => ({ default: m.RatesPage })));

/** Every page of the app, inside the shared layout. Each milestone adds its pages here. */
export function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />}>
            <AppLayout />
          </Suspense>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="rates" element={<RatesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
