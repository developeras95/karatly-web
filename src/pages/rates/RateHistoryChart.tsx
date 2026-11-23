import { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { useRateHistory } from '../../api/rates';
import { daysBefore, formatCompactMoney, formatDate, formatMoney, todayIso } from '../../lib/format';

const RANGES = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
];

/** Daily rate of one metal over a chosen range. */
export function RateHistoryChart({ metal, metalName }: { metal: string; metalName: string }) {
  const theme = useTheme();
  const [days, setDays] = useState(30);
  const history = useRateHistory(metal, daysBefore(todayIso(), days));
  const points = history.data?.points ?? [];

  return (
    <Paper sx={{ p: 2 }} component="section" aria-label="Rate history">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          {metalName} history
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={days}
          onChange={(_, value: number | null) => value && setDays(value)}
          aria-label="Range"
        >
          {RANGES.map((range) => (
            <ToggleButton key={range.days} value={range.days}>
              {range.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {history.isPending ? (
        <CircularProgress size={24} aria-label="Loading history" />
      ) : points.length < 2 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          {points.length === 0
            ? 'No rates stored for this period yet.'
            : 'Only one day stored so far. The chart fills in as rates are fetched each day.'}
        </Typography>
      ) : (
        <LineChart
          height={280}
          xAxis={[{ scaleType: 'point', data: points.map((point) => formatDate(point.date)) }]}
          yAxis={[{ width: 64, valueFormatter: (value: number) => formatCompactMoney(value, history.data!.currency) }]}
          series={[
            {
              data: points.map((point) => Number(point.pricePerGram)),
              label: `${metalName} per gram`,
              showMark: points.length <= 31,
              color: theme.palette.primary.main,
              valueFormatter: (value) => (value == null ? '' : formatMoney(value, history.data!.currency)),
            },
          ]}
        />
      )}
    </Paper>
  );
}
