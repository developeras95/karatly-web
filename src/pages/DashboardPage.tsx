import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PageHeader } from '../components/PageHeader';
import { useHealth } from '../api/health';
import { useMetals, useUnits } from '../api/reference';
import { formatGrams } from '../lib/format';

function StatusChip({ status }: { status: string }) {
  return <Chip size="small" label={status} color={status === 'UP' ? 'success' : 'error'} variant="outlined" />;
}

function ApiStatus() {
  const health = useHealth();
  if (health.isPending) {
    return <CircularProgress size={20} aria-label="Checking the API" />;
  }
  if (health.isError) {
    return (
      <Alert severity="error">
        <strong>Cannot reach Karatly.</strong> {health.error.message}
      </Alert>
    );
  }
  return (
    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography>API</Typography>
        <StatusChip status={health.data.status} />
      </Stack>
      {health.data.components?.db && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>Database</Typography>
          <StatusChip status={health.data.components.db.status} />
        </Stack>
      )}
    </Stack>
  );
}

function ReferenceData() {
  const metals = useMetals();
  const units = useUnits();
  if (metals.isError || units.isError) {
    return <Typography color="text.secondary">Reference data is not available.</Typography>;
  }
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Metals
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {metals.data?.map((metal) => (
            <Chip key={metal.code} label={`${metal.name} (${metal.code})`} />
          ))}
        </Stack>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Weight units
        </Typography>
        {units.data?.map((unit) => (
          <Typography key={unit.code} variant="body2">
            1 {unit.symbol} = {formatGrams(unit.gramsPerUnit)} g
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/** The first page. For now it shows that the API is up and the reference data it serves. */
export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Your metals, measured. Holdings and profit arrive in the next milestones."
      />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h2" gutterBottom>
            Status
          </Typography>
          <ApiStatus />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h2" gutterBottom>
            Reference data
          </Typography>
          <ReferenceData />
        </Paper>
      </Stack>
    </>
  );
}
