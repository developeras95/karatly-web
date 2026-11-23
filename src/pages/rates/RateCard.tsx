import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Rate } from '../../api/rates';
import { formatDate, formatMoney, SOURCE_LABELS } from '../../lib/format';

/** One metal's latest rate per gram of pure metal, how it was reached, and the rate for each purity. */
export function RateCard({ rate, selected, onSelect }: { rate: Rate; selected: boolean; onSelect: () => void }) {
  return (
    <Paper
      component="section"
      aria-label={`${rate.metalName} rate`}
      onClick={onSelect}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : undefined,
        borderWidth: selected ? 2 : 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h2" component="h3" sx={{ flexGrow: 1 }}>
          {rate.metalName}
        </Typography>
        {rate.stale && (
          <Tooltip title="No rate for today yet; this is the newest one">
            <Chip size="small" color="warning" label={`From ${formatDate(rate.date)}`} />
          </Tooltip>
        )}
      </Box>
      <Typography sx={{ fontSize: '1.6rem', fontWeight: 600 }}>
        {formatMoney(rate.pricePerGram, rate.currency)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        per gram, pure · {SOURCE_LABELS[rate.source] ?? rate.source}
        {rate.spotPricePerGram != null && Number(rate.premiumPercent) > 0
          ? ` · spot ${formatMoney(rate.spotPricePerGram, rate.currency)} + ${rate.premiumPercent}%`
          : ''}
      </Typography>
      {rate.purities.length > 0 && (
        <Table size="small" sx={{ mt: 1 }} aria-label={`${rate.metalName} by purity`}>
          <TableBody>
            {rate.purities.map((purity) => (
              <TableRow key={purity.label} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ pl: 0 }}>{purity.label}</TableCell>
                <TableCell align="right" sx={{ pr: 0 }}>
                  {formatMoney(purity.pricePerGram, rate.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
