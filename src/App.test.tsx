import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { App } from './App';
import { renderWithProviders } from './test/render';
import { problem, server } from './test/server';

describe('App', () => {
  it('shows the dashboard with the API status and reference data', async () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Dashboard' }).length).toBeGreaterThan(0);
    expect(await screen.findByText('Database')).toBeInTheDocument();
    expect(screen.getAllByText('UP')).toHaveLength(2);
    expect(await screen.findByText('Gold (XAU)')).toBeInTheDocument();
    expect(screen.getByText('1 tola = 11.6638038 g')).toBeInTheDocument();
    expect(screen.getByText('1 kg = 1,000 g')).toBeInTheDocument();
  });

  it('says when the API cannot be reached', async () => {
    server.use(
      http.get('*/actuator/health', () => HttpResponse.error()),
      http.get('*/api/v1/metals', () => HttpResponse.error()),
    );

    renderWithProviders(<App />);

    expect(await screen.findByText('Cannot reach Karatly.')).toBeInTheDocument();
    expect(await screen.findByText('Reference data is not available.')).toBeInTheDocument();
  });

  it('shows a DOWN database reported by the health check', async () => {
    server.use(
      http.get('*/actuator/health', () =>
        HttpResponse.json({ status: 'DOWN', components: { db: { status: 'DOWN' } } }, { status: 503 }),
      ),
    );

    renderWithProviders(<App />);

    expect(await screen.findAllByText('DOWN')).toHaveLength(2);
  });

  it('shows a not-found page for an unknown address', () => {
    renderWithProviders(<App />, { route: '/no-such-page' });

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('API errors', () => {
  it('uses the problem detail of a failed request', async () => {
    server.use(http.get('*/api/v1/metals', () => problem(500, 'INTERNAL_ERROR', 'Something went wrong.')));
    const { api, ApiError } = await import('./api/client');

    const error = await api.GET('/api/v1/metals').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong.' });
  });
});
