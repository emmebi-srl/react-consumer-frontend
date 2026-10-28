import z from 'zod';

/** Email addresses separated by ";" or ",": empty means "use the defaults". */
export const emailAddressListSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === '' ||
      value
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter((item) => item !== '')
        .every((item) => z.email().safeParse(item).success),
    { message: 'Inserire indirizzi email validi, separati da ";"' },
  );
