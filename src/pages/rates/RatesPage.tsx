import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLatestRates, useRefreshRates, type RefreshResult } from '../../api/rates';
import { useMetals } from '../../api/reference';
import { useNotify } from '../../components/Notifications';
import { PageHeader } from '../../components/PageHeader';
import { SOURCE_LABELS } from '../../lib/format';
import { ManualRateDialog } from './ManualRateDialog';
import { PremiumsTable } from './PremiumsTable';
import { ProvidersTable } from './ProvidersTable';
import { RateCard } from './RateCard';
import { RateHistoryChart } from './RateHistoryChart';

const STATUS_TEXT: Record<RefreshResult['status'], string> = {
  FETCHED: 'fetched',
  NOT_DUE: 'still fresh',
  UNAVAILABLE: 'not set up',
  OVER_BUDGET: 'monthly limit reached',
  FAILED: 'failed',
};

/** One sentence for the result of "Fetch now", e.g. "goldprice.dev: fetched · goldapi.io: not set up". */
function describe(results: RefreshResult[]): string {
  return results.map((result) => `${SOURCE_LABELS[result.provider]}: ${STATUS_TEXT[result.status]}`).join(' · ');
}

/** Today's rates per metal and purity, their history, manual rates, premiums and the rate providers. */
export function RatesPage() {
  const notify = useNotify();
  const rates = useLatestRates();
  const metals = useMetals();
  const refresh = useRefreshRates();
  const [selected, setSelected] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const current = rates.data?.find((rate) => rate.metal === selected) ?? rates.data?.[0];

  const fetchNow = async () => {
    try {
      const results = await refresh.mutateAsync();
      const failed = results.some((result) => result.status === 'FAILED' || result.status === 'OVER_BUDGET');
      notify(describe(results), failed ? 'warning' : 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not fetch rates', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Rates"
        subtitle="Per gram, in rupees. Click a metal to see its history."
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} onClick={fetchNow} loading={refresh.isPending} loadingPosition="start">
              Fetch now
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Enter a rate
            </Button>
          </Stack>
        }
      />

      {rates.isPending && <CircularProgress aria-label="Loading rates" />}
      {rates.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Cannot load rates.</strong> {rates.error.message}
        </Alert>
      )}
      {rates.data?.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No rates yet. Click <strong>Fetch now</strong>, or enter one by hand.
        </Alert>
      )}

      <Stack spacing={2}>
        {rates.data && rates.data.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            {rates.data.map((rate) => (
              <RateCard
                key={rate.metal}
                rate={rate}
                selected={rate.metal === current?.metal}
                onSelect={() => setSelected(rate.metal)}
              />
            ))}
          </Box>
        )}

        {current && <RateHistoryChart metal={current.metal} metalName={current.metalName} />}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' } }}>
          <PremiumsTable metals={metals.data ?? []} />
          <ProvidersTable />
        </Box>
        {rates.data && (
          <Typography variant="caption" color="text.secondary">
            Spot prices: goldprice.dev (gold, silver, copper, 15 minutes delayed) and goldapi.io (platinum, palladium).
          </Typography>
        )}
      </Stack>

      <ManualRateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        metals={metals.data ?? []}
        defaultMetal={current?.metal ?? 'XAU'}
      />
    </>
  );
}
