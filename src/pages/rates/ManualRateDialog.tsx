import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { ApiError } from '../../api/client';
import { useAddManualRate } from '../../api/rates';
import type { Metal } from '../../api/reference';
import { useNotify } from '../../components/Notifications';
import { todayIso } from '../../lib/format';
import { manualRateSchema, type ManualRateValues } from './manualRateForm';

/**
 * Enter a rate by hand, e.g. the day's IBJA rate for 999 gold. It replaces fetched rates for that day.
 * The price is per gram of pure metal, in rupees.
 */
export function ManualRateDialog({
  open,
  onClose,
  metals,
  defaultMetal,
}: {
  open: boolean;
  onClose: () => void;
  metals: Metal[];
  defaultMetal: string;
}) {
  const today = todayIso();
  const notify = useNotify();
  const addRate = useAddManualRate();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ManualRateValues>({
    resolver: zodResolver(manualRateSchema(today)),
    values: { metal: defaultMetal, date: today, pricePerGram: '' },
  });

  const close = () => {
    reset();
    addRate.reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const saved = await addRate.mutateAsync({
        metal: values.metal,
        date: values.date,
        pricePerGram: Number(values.pricePerGram),
      });
      notify(`${saved.metalName} rate saved for ${saved.date}`);
      close();
    } catch (error) {
      if (error instanceof ApiError) {
        for (const field of ['metal', 'date', 'pricePerGram'] as const) {
          const message = error.messageFor(field);
          if (message) {
            setError(field, { message });
          }
        }
        if (error.fieldErrors.length === 0) {
          setError('root', { message: error.message });
        }
      }
    }
  });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <form onSubmit={submit} noValidate>
        <DialogTitle>Enter a rate</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Per gram of pure metal (999). It replaces the fetched rate for that day.
          </DialogContentText>
          <Stack spacing={2}>
            <Controller
              name="metal"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Metal" error={!!errors.metal} helperText={errors.metal?.message}>
                  {metals.map((metal) => (
                    <MenuItem key={metal.code} value={metal.code}>
                      {metal.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today } }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />
            <Controller
              name="pricePerGram"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price per gram"
                  inputMode="decimal"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  error={!!errors.pricePerGram}
                  helperText={errors.pricePerGram?.message}
                />
              )}
            />
            {errors.root && <DialogContentText color="error">{errors.root.message}</DialogContentText>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="contained" loading={addRate.isPending}>
            Save rate
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
