import { useState } from 'react';
import { Autocomplete, Card, CardContent, CardHeader, TextField, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useDdtJobLots } from '~/proxies/aries-proxy/ddts';
import { DdtJobLink } from '~/types/aries-proxy/ddts';
import { DdtFormValues } from '../ddtFormValues';

const lotLabel = (lot: DdtJobLink) =>
  [
    `${lot.jobId}/${lot.jobYear} ${lot.jobDescription?.trim() ?? ''}`.trim(),
    lot.subJobName?.trim(),
    lot.lotDescription?.trim(),
  ]
    .filter(Boolean)
    .join(' › ');

const sameLot = (a: DdtJobLink, b: DdtJobLink) =>
  a.jobId === b.jobId && a.jobYear === b.jobYear && a.subJobId === b.subJobId && a.lotId === b.lotId;

/**
 * Job of the Delphi editor (commessa, sottocommessa, lotto): the open jobs of the customer. On save the rows
 * go into the lot, the economy part outside the quote, like TFDDTEditor.SaveDDTProducts.
 */
const DdtJobCard: React.FC = () => {
  const { control, setValue, getValues } = useFormContext<DdtFormValues>();
  const isCustomer = useWatch({ control, name: 'isCustomer' });
  const recipient = useWatch({ control, name: 'recipient' });
  const jobLink = useWatch({ control, name: 'jobLink' });
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const lotsQuery = useDdtJobLots(isCustomer ? recipient?.id : null, search);

  if (!isCustomer) return null;

  const options = lotsQuery.data ?? [];
  // The linked lot stays selectable even when the job is closed or out of the search.
  const allOptions = jobLink && !options.some((lot) => sameLot(lot, jobLink)) ? [jobLink, ...options] : options;

  return (
    <Card variant="outlined">
      <CardHeader
        title="Commessa"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheader="Al salvataggio le quantità delle righe vengono portate nel lotto; quelle in economia vanno fuori preventivo."
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Autocomplete<DdtJobLink>
          value={jobLink}
          options={allOptions}
          loading={lotsQuery.isFetching}
          disabled={!recipient}
          filterOptions={(items) => items}
          isOptionEqualToValue={sameLot}
          getOptionLabel={lotLabel}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') setSearchText(value);
            if (reason === 'clear') setSearchText('');
          }}
          onChange={(_, lot) => {
            setValue('jobLink', lot, { shouldDirty: true });
            // Delphi takes the system of the lot (ReloadSystem) when the DDT has none.
            if (lot?.systemId && getValues('systemId') === '')
              setValue('systemId', lot.systemId, { shouldDirty: true });
          }}
          noOptionsText={recipient ? 'Nessuna commessa aperta del cliente' : 'Scegli prima il cliente'}
          sx={{ maxWidth: 720 }}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Commessa › sottocommessa › lotto (nessuna se vuoto)" />
          )}
        />
        {!recipient ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Le commesse proposte sono quelle aperte del cliente.
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DdtJobCard;
