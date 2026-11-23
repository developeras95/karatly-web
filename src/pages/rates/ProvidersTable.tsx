import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useProviders } from '../../api/rates';
import { formatDateTime, SOURCE_LABELS } from '../../lib/format';

/** Where rates come from, how much of each free quota is used, and when the cache next expires. */
export function ProvidersTable() {
  const providers = useProviders();
  const ttlMinutes = providers.data?.[0]?.ttlMinutes;

  return (
    <Paper sx={{ p: 2 }} component="section" aria-label="Rate providers">
      <Typography variant="h2" gutterBottom>
        Rate providers
      </Typography>
      {ttlMinutes != null && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Rates are kept for {ttlMinutes / 60} hours before they are fetched again.
        </Typography>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Provider</TableCell>
            <TableCell>Metals</TableCell>
            <TableCell>Status</TableCell>
            <TableCell sx={{ minWidth: 160 }}>Requests this month</TableCell>
            <TableCell>Last fetch</TableCell>
            <TableCell>Next fetch</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {providers.data?.map((provider) => {
            const used = Math.min(100, (provider.requestsThisMonth / Math.max(1, provider.monthlyBudget)) * 100);
            return (
              <TableRow key={provider.provider}>
                <TableCell>{SOURCE_LABELS[provider.provider] ?? provider.provider}</TableCell>
                <TableCell>{provider.metals.join(', ')}</TableCell>
                <TableCell>
                  {provider.available ? (
                    <Chip size="small" color="success" variant="outlined" label="Active" />
                  ) : (
                    <Tooltip title={provider.unavailableReason ?? ''}>
                      <Chip size="small" color="warning" variant="outlined" label="Not set up" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {provider.requestsThisMonth} of {provider.monthlyBudget}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={used}
                    color={used > 90 ? 'error' : used > 70 ? 'warning' : 'primary'}
                    aria-label={`${SOURCE_LABELS[provider.provider]} quota used`}
                  />
                </TableCell>
                <TableCell>
                  {provider.lastFetchAt ? (
                    <>
                      {formatDateTime(provider.lastFetchAt)}
                      {provider.lastFetchSucceeded === false && (
                        <Chip size="small" color="error" label="Failed" sx={{ ml: 1 }} />
                      )}
                    </>
                  ) : (
                    'Never'
                  )}
                </TableCell>
                <TableCell>{provider.available ? formatDateTime(provider.nextFetchDue) : '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
