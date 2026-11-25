import { useMemo } from 'react';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useInvoiceLookups } from '~/proxies/aries-proxy/invoices';
import { formatMoney, newMoney } from '~/utils/money';
import { computeTotals, InvoiceFormValues } from '../invoiceFormValues';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

interface Props {
  showCosts: boolean;
}

/** Amounts by VAT and totals while editing (the server recomputes them on save), like RefreshTotalsProducts. */
const InvoiceTotalsCard: React.FC<Props> = ({ showCosts }) => {
  const { control } = useFormContext<InvoiceFormValues>();
  const values = useWatch({ control }) as InvoiceFormValues;
  const { data: lookups } = useInvoiceLookups();
  const totals = useMemo(() => computeTotals(values, lookups?.vatTypes ?? []), [values, lookups]);

  return (
    <Card variant="outlined">
      <CardHeader title="Totali" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>IVA</TableCell>
                <TableCell align="right">Imponibile</TableCell>
                <TableCell align="right">Imposta</TableCell>
                <TableCell align="right">Totale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {totals.amounts.map((amount) => (
                <TableRow key={amount.vat.id}>
                  <TableCell>{amount.vat.name ?? `${amount.vat.rate}%`}</TableCell>
                  <TableCell align="right">{toEuro(amount.taxableAmount)}</TableCell>
                  <TableCell align="right">{toEuro(amount.taxAmount)}</TableCell>
                  <TableCell align="right">{toEuro(amount.taxableAmount + amount.taxAmount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Totale documento</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{toEuro(totals.taxableAmount)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{toEuro(totals.taxAmount)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{toEuro(totals.totalAmount)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {showCosts ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Costo {toEuro(totals.totalCost)} · Guadagno {toEuro(totals.taxableAmount - totals.totalCost)}
            </Typography>
          ) : null}
          {totals.vat10ProductsAlert ? (
            <Alert severity="warning">
              IVA 10%: il prezzo del materiale dovrebbe essere inferiore a quello della manodopera.
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InvoiceTotalsCard;
