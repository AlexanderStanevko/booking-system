import { z } from 'zod';

const minimumInt32 = -2_147_483_648;
const maximumInt32 = 2_147_483_647;

function optionalInteger(min: number, message: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (/^-?\d+$/.test(value) && Number(value) >= min && Number(value) <= maximumInt32),
      message,
    )
    .transform((value) => (value === '' ? undefined : Number(value)));
}

export const roomFilterSchema = z.object({
  minCapacity: optionalInteger(1, 'Enter a positive whole number.'),
  floor: optionalInteger(minimumInt32, 'Enter a valid whole-number floor.'),
});
