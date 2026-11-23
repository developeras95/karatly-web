import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { App } from '../../App';
import type { ManualRateRequest } from '../../api/rates';
import { renderWithProviders } from '../../test/render';
import { aRate, problem, server } from '../../test/server';

describe('Rates page', () => {
  it('shows each metal with its rate per purity, the history, premiums and providers', async () => {
    renderWithProviders(<App />, { route: '/rates' });

    const gold = await screen.findByRole('region', { name: 'Gold rate' });
    expect(within(gold).getByText('₹11,902.16')).toBeInTheDocument();
    expect(within(gold).getByText(/spot ₹10,820.15 \+ 10%/)).toBeInTheDocument();
    expect(within(gold).getByText('22K (916)')).toBeInTheDocument();
    expect(within(gold).getByText('₹10,902.38')).toBeInTheDocument();

    const copper = screen.getByRole('region', { name: 'Copper rate' });
    expect(within(copper).getByText('From 20 Nov 2026')).toBeInTheDocument();
    expect(within(copper).getByText('₹1.1285')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Gold history' })).toBeInTheDocument();
    expect(await screen.findByText('Rates are kept for 12 hours before they are fetched again.')).toBeInTheDocument();
    expect(screen.getByText('46 of 4500')).toBeInTheDocument();
    expect(screen.getByText('Not set up')).toBeInTheDocument();
    expect(await screen.findByLabelText('Gold premium')).toHaveValue('10');
  });

  it('switches the history to the metal that is clicked', async () => {
    const asked: string[] = [];
    server.use(
      http.get('*/api/v1/rates/history', ({ request }) => {
        asked.push(new URL(request.url).searchParams.get('metal') ?? '');
        return HttpResponse.json({ metal: 'XAG', currency: 'INR', from: '2026-10-25', to: '2026-11-24', points: [] });
      }),
    );
    renderWithProviders(<App />, { route: '/rates' });

    await userEvent.click(await screen.findByRole('region', { name: 'Silver rate' }));

    expect(await screen.findByRole('heading', { name: 'Silver history' })).toBeInTheDocument();
    expect(await screen.findByText('No rates stored for this period yet.')).toBeInTheDocument();
    await waitFor(() => expect(asked).toContain('XAG'));
  });

  it('enters a rate by hand and sends it to the API', async () => {
    let sent: ManualRateRequest | undefined;
    server.use(
      http.post('*/api/v1/rates', async ({ request }) => {
        sent = (await request.json()) as ManualRateRequest;
        return HttpResponse.json(aRate({ source: 'MANUAL', pricePerGram: 12850.5 }), { status: 201 });
      }),
    );
    renderWithProviders(<App />, { route: '/rates' });

    await userEvent.click(await screen.findByRole('button', { name: 'Enter a rate' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Price per gram'), 'abc');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save rate' }));
    expect(await within(dialog).findByText('A positive amount, e.g. 12850.50')).toBeInTheDocument();

    await userEvent.clear(within(dialog).getByLabelText('Price per gram'));
    await userEvent.type(within(dialog).getByLabelText('Price per gram'), '12850.50');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save rate' }));

    expect(await screen.findByText(/Gold rate saved for/)).toBeInTheDocument();
    expect(sent).toMatchObject({ metal: 'XAU', pricePerGram: 12850.5 });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the field error the API returns for a manual rate', async () => {
    server.use(
      http.post('*/api/v1/rates', () =>
        problem(400, 'VALIDATION_FAILED', 'One or more fields are invalid.', [
          { field: 'pricePerGram', message: 'must be greater than 0' },
        ]),
      ),
    );
    renderWithProviders(<App />, { route: '/rates' });

    await userEvent.click(await screen.findByRole('button', { name: 'Enter a rate' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Price per gram'), '5');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save rate' }));

    expect(await within(dialog).findByText('must be greater than 0')).toBeInTheDocument();
  });

  it('saves a premium', async () => {
    let body: unknown;
    server.use(
      http.put('*/api/v1/rates/premiums/XAU', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ metal: 'XAU', premiumPercent: 6, updatedAt: '2026-11-24T10:00:00Z' });
      }),
    );
    renderWithProviders(<App />, { route: '/rates' });

    const input = await screen.findByLabelText('Gold premium');
    await userEvent.clear(input);
    await userEvent.type(input, '6');
    const row = input.closest('tr')!;
    await userEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Gold premium set to 6%; applies from the next fetch')).toBeInTheDocument();
    expect(body).toEqual({ premiumPercent: 6 });
  });

  it('fetches now and says what each provider did', async () => {
    server.use(
      http.post('*/api/v1/rates/refresh', () =>
        HttpResponse.json([
          { provider: 'GOLDPRICE_DEV', status: 'FETCHED', metals: ['XAU', 'XAG', 'XCU'], message: null },
          { provider: 'GOLDAPI_IO', status: 'UNAVAILABLE', metals: ['XPT', 'XPD'], message: 'No API key' },
        ]),
      ),
    );
    renderWithProviders(<App />, { route: '/rates' });

    await userEvent.click(await screen.findByRole('button', { name: 'Fetch now' }));

    expect(await screen.findByText('goldprice.dev: fetched · goldapi.io: not set up')).toBeInTheDocument();
  });

  it('invites a first fetch when there are no rates yet', async () => {
    server.use(http.get('*/api/v1/rates/latest', () => HttpResponse.json([])));
    renderWithProviders(<App />, { route: '/rates' });

    expect(await screen.findByText(/No rates yet/)).toBeInTheDocument();
  });

  it('says when rates cannot be loaded', async () => {
    server.use(http.get('*/api/v1/rates/latest', () => problem(500, 'INTERNAL_ERROR', 'Something went wrong.')));
    renderWithProviders(<App />, { route: '/rates' });

    expect(await screen.findByText('Cannot load rates.')).toBeInTheDocument();
  });
});
