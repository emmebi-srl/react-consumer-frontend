import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { useInvoicesTotals } from '~/proxies/aries-proxy/invoices';
import { formatMoney, newMoney } from '~/utils/money';
import { toInvoiceSearchRequest, useFilterState } from '../state';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

const TotalCard: React.FC<{ title: string; value?: number; caption?: string }> = ({ title, value, caption }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h5">{value === undefined ? <Skeleton width={140} /> : toEuro(value)}</Typography>
      {caption ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {caption}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

/** Totals of the invoices matching the filters, like the yearly totals panel of the Delphi list. */
const InvoiceTotalsCards: React.FC = () => {
  const filters = useFilterState();
  const { data, isError } = useInvoicesTotals(toInvoiceSearchRequest(filters));

  if (isError) return null;

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <TotalCard
        title="Imponibile"
        value={data?.taxableAmount}
        caption={data ? `${data.count} documenti` : undefined}
      />
      <TotalCard title="IVA" value={data?.taxAmount} />
      <TotalCard title="Totale" value={data?.totalAmount} />
      <TotalCard
        title="Margine"
        value={data ? data.taxableAmount - data.totalCost : undefined}
        caption={data ? `Costo ${toEuro(data.totalCost)}` : undefined}
      />
    </Box>
  );
};

export default InvoiceTotalsCards;
