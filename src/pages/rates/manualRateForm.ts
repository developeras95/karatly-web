import { z } from 'zod';

/** The manual rate form's rules, matching ManualRateRequest in the API, so mistakes show before sending. */
export function manualRateSchema(today: string) {
  return z.object({
    metal: z.string().min(1, 'Choose a metal'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date')
      .refine((value) => value <= today, 'Cannot be in the future'),
    pricePerGram: z
      .string()
      .trim()
      .refine((value) => /^\d{1,13}(\.\d{1,6})?$/.test(value) && Number(value) > 0, 'A positive amount, e.g. 12850.50'),
  });
}

export type ManualRateValues = z.input<ReturnType<typeof manualRateSchema>>;
