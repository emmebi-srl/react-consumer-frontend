import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { useDdtsTotals } from '~/proxies/aries-proxy/ddts';
import { formatMoney, newMoney } from '~/utils/money';
import { toDdtSearchRequest, useFilterState } from '../state';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

const TotalCard: React.FC<{ title: string; price?: number; cost?: number }> = ({ title, price, cost }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h5">{price === undefined ? <Skeleton width={140} /> : toEuro(price)}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {cost === undefined ? <Skeleton width={100} /> : `Costo ${toEuro(cost)}`}
      </Typography>
    </CardContent>
  </Card>
);

/** Same totals as the Delphi DDT screen, calculated on the DDTs that match the current filters. */
const DdtTotalsCards: React.FC = () => {
  const filters = useFilterState();
  const { data, isError } = useDdtsTotals(toDdtSearchRequest(filters));

  if (isError) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <TotalCard title="Totale" price={data?.totalPrice} cost={data?.totalCost} />
        <TotalCard title="Non fatturato" price={data?.notInvoicedPrice} cost={data?.notInvoicedCost} />
        <TotalCard title="Fatturato" price={data?.invoicedPrice} cost={data?.invoicedCost} />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Calcolati sui DDT filtrati, esclusi quelli con causale in garanzia.
      </Typography>
    </Stack>
  );
};

export default DdtTotalsCards;
