import { Card, CardContent, CardHeader, Checkbox, Collapse, FormControlLabel, Stack, TextField } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { InvoiceFormValues } from '../invoiceFormValues';

/**
 * Annotations (printed), internal description (not printed) and purchase order data (CIG/CUP of a public
 * administration, DatiOrdineAcquisto of the e-invoice).
 */
const InvoiceNotesCard: React.FC = () => {
  const { control } = useFormContext<InvoiceFormValues>();
  const hasPurchaseOrder = useWatch({ control, name: 'hasPurchaseOrder' });

  return (
    <Card variant="outlined">
      <CardHeader title="Note" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Controller
            name="annotations"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={2}
                size="small"
                label="Annotazioni"
                helperText="Stampate in fattura. %offnota toglie la nota fissa, %banca e %iban mostrano solo banca e iban."
              />
            )}
          />
          <Controller
            name="internalNote"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Descrizione interna"
                helperText="Non stampata: compare nella lista fatture."
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            )}
          />
          <Controller
            name="hasPurchaseOrder"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                label="Ordine di acquisto (pubblica amministrazione)"
              />
            )}
          />
          <Collapse in={hasPurchaseOrder} unmountOnExit>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Controller
                name="purchaseOrderDocumentId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    size="small"
                    label="Id documento"
                    slotProps={{ htmlInput: { maxLength: 20 } }}
                  />
                )}
              />
              <Controller
                name="purchaseOrderDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    type="date"
                    size="small"
                    label="Data ordine"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller
                name="purchaseOrderCig"
                control={control}
                render={({ field }) => (
                  <TextField {...field} size="small" label="Codice CIG" slotProps={{ htmlInput: { maxLength: 15 } }} />
                )}
              />
              <Controller
                name="purchaseOrderCup"
                control={control}
                render={({ field }) => (
                  <TextField {...field} size="small" label="Codice CUP" slotProps={{ htmlInput: { maxLength: 15 } }} />
                )}
              />
            </Stack>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InvoiceNotesCard;
