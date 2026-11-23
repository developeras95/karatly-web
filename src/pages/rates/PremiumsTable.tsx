import { useState } from 'react';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ApiError } from '../../api/client';
import { usePremiums, useUpdatePremium, type Premium } from '../../api/rates';
import type { Metal } from '../../api/reference';
import { useNotify } from '../../components/Notifications';

const PERCENT = /^\d{1,3}(\.\d{1,4})?$/;

function PremiumRow({ premium, metalName }: { premium: Premium; metalName: string }) {
  const notify = useNotify();
  const update = useUpdatePremium();
  const [value, setValue] = useState(String(premium.premiumPercent));
  const valid = PERCENT.test(value.trim()) && Number(value) <= 100;
  const changed = valid && Number(value) !== Number(premium.premiumPercent);

  const save = async () => {
    try {
      await update.mutateAsync({ metal: premium.metal, premiumPercent: Number(value) });
      notify(`${metalName} premium set to ${Number(value)}%; applies from the next fetch`);
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Could not save the premium', 'error');
    }
  };

  return (
    <TableRow>
      <TableCell>{metalName}</TableCell>
      <TableCell>
        <TextField
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="decimal"
          error={!valid}
          helperText={valid ? undefined : '0 to 100'}
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            htmlInput: { 'aria-label': `${metalName} premium` },
          }}
          sx={{ width: 130 }}
        />
      </TableCell>
      <TableCell align="right">
        <Button size="small" disabled={!changed} loading={update.isPending} onClick={save}>
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Premium over the international spot price per metal, e.g. Indian import duty. It is applied when rates are
 * fetched, so a change shows from the next fetch ("Fetch now" applies it at once).
 */
export function PremiumsTable({ metals }: { metals: Metal[] }) {
  const premiums = usePremiums();
  const names = new Map(metals.map((metal) => [metal.code, metal.name]));

  return (
    <Paper sx={{ p: 2 }} component="section" aria-label="Premiums">
      <Typography variant="h2" gutterBottom>
        Premium over spot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Added to the international spot price, e.g. import duty. Applies from the next fetch.
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Metal</TableCell>
            <TableCell>Premium</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {premiums.data?.map((premium) => (
            <PremiumRow
              key={`${premium.metal}-${premium.premiumPercent}`}
              premium={premium}
              metalName={names.get(premium.metal) ?? premium.metal}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
