import React from 'react';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SystemSearch from '~/components/Searches/SystemSearch';
import { useSearchParams } from 'react-router-dom';
import { Button, MenuItem, Stack, TextField, useTheme } from '@mui/material';

const KM_RANGES = [5, 10, 25, 50, 100];

const SearchFormSchema = z.object({
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  rangeKm: z.number().refine((val) => KM_RANGES.includes(val), {
    message: `Deve essere uno dei seguenti valori: ${KM_RANGES.join(', ')}`,
  }),
});

type SearchFormModel = z.infer<typeof SearchFormSchema>;

const SearchForm: React.FC<{
  initialValues?: Partial<SearchFormModel>;
  onSubmit: (data: SearchFormModel) => void;
  isLoading?: boolean;
}> = ({ initialValues, onSubmit, isLoading }) => {
  const [searchParams] = useSearchParams();
  const initialSystemId = searchParams.get('systemId') || undefined;
  const [systemId, setSystem] = React.useState<number | undefined>(
    initialSystemId ? Number(initialSystemId) : undefined,
  );
  const theme = useTheme();

  const form = useForm({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      address: '',
      city: '',
      postalCode: '',
      rangeKm: 10,
      ...initialValues,
    },
  });
  return (
    <Stack spacing={2} direction="column">
      <SystemSearch
        systemId={systemId}
        sx={{
          maxWidth: 400,
          [theme.breakpoints.down('md')]: {
            maxWidth: '100%',
          },
        }}
        onSelect={(system) => {
          setSystem(system?.id);

          const destination = system?.destination;
          form.setValue(
            'address',
            destination?.street ? `${destination.street}, ${destination.houseNumber || ''}` : '',
          );
          form.setValue('city', destination?.municipality || '', { shouldValidate: true, shouldTouch: true });
          form.setValue('postalCode', destination?.postalCode || '');
        }}
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <Controller
            control={form.control}
            name="address"
            render={({ field }) => {
              return <TextField {...field} label="Indirizzo" sx={{ flex: 3 }} />;
            }}
          />
          <Controller
            control={form.control}
            name="city"
            render={({ field }) => {
              return <TextField {...field} label="Città" sx={{ flex: 2 }} />;
            }}
          />
          <Controller
            control={form.control}
            name="postalCode"
            render={({ field }) => {
              return <TextField {...field} label="CAP" sx={{ flex: 1 }} />;
            }}
          />
          <Controller
            control={form.control}
            name="rangeKm"
            render={({ field }) => {
              return (
                <TextField {...field} select label="Distanza (km)" sx={{ flex: 1 }}>
                  {KM_RANGES.map((value) => (
                    <MenuItem key={`key_${value}`} value={value}>
                      {value} km
                    </MenuItem>
                  ))}
                </TextField>
              );
            }}
          />
          <Button type="submit" variant="contained" loading={isLoading}>
            Cerca
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default SearchForm;
