import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { useDashboardMonthlyStatsDetails } from '~/proxies/aries-proxy/dashboard';
import { RouteConfig } from '~/routes/routeConfig';
import { DashboardAsideItem, DashboardAsideSection } from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import { SelectedMonthlyStats } from '../state';

interface MonthlyStatsAsideContentProps {
  item: SelectedMonthlyStats;
}

const getCounterpartLink = (item: DashboardAsideItem) => {
  if (item.counterpartType === 'customer' && item.counterpartId) {
    return RouteConfig.CustomerDetail.buildLink({ customerId: item.counterpartId.toString() });
  }

  return undefined;
};

const ItemRow: React.FC<{ item: DashboardAsideItem }> = ({ item }) => {
  const date = getDateByUnixtimestamp({ unixTimestamp: item.date });
  const counterpartLink = getCounterpartLink(item);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 1.25 }}>
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={600} noWrap variant="body1">
            {item.title}
          </Typography>
          {item.counterpartName ? (
            counterpartLink ? (
              <Typography
                color="text.secondary"
                component={RouterLink}
                display="block"
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
                to={counterpartLink}
                variant="body2"
              >
                {item.counterpartName}
              </Typography>
            ) : (
              <Typography
                color="text.secondary"
                display="block"
                sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                variant="body2"
              >
                {item.counterpartName}
              </Typography>
            )
          ) : null}
          {item.subtitle ? (
            <Typography
              color="text.secondary"
              display="block"
              sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              variant="caption"
            >
              {item.subtitle}
            </Typography>
          ) : null}
          <Typography color="text.secondary" display="block" variant="caption">
            {format(date, 'dd MMM yyyy', { locale: it })}
          </Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.75}>
          <Chip
            color={item.isOpen ? 'warning' : 'default'}
            label={item.isOpen ? 'Aperto' : 'Chiuso'}
            size="small"
            variant={item.isOpen ? 'filled' : 'outlined'}
          />
          {typeof item.amount === 'number' ? (
            <Typography color="text.secondary" variant="caption">
              {formatMoney(newMoney(item.amount, 'EUR'))}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

const AsideSection: React.FC<{ section: DashboardAsideSection }> = ({ section }) => (
  <Box>
    <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography fontWeight={700} variant="subtitle1">
        {section.title}
      </Typography>
      <Typography color="text.secondary" variant="caption">
        {section.items.length}
      </Typography>
    </Stack>

    {section.items.length > 0 ? (
      section.items.map((item) => <ItemRow key={`${section.key}-${item.year}-${item.id}`} item={item} />)
    ) : (
      <Alert severity="info">Nessun elemento nel mese selezionato.</Alert>
    )}

    {section.hasMore && section.moreUrl ? (
      <Button component={RouterLink} size="small" sx={{ mt: 1.25 }} to={section.moreUrl} variant="text">
        Vedi altro
      </Button>
    ) : null}
  </Box>
);

const MonthlyStatsAsideContent: React.FC<MonthlyStatsAsideContentProps> = ({ item }) => {
  const detailsQuery = useDashboardMonthlyStatsDetails({ month: item.month, year: item.year });
  const monthDate = new Date(item.year, item.month - 1, 1);

  return (
    <>
      <AsideSummaryView title="Dettaglio documenti" subtitle={format(monthDate, 'MMMM yyyy', { locale: it })} />
      <AsideContentView sx={{ flexDirection: 'column', gap: 3, overflowY: 'scroll' }}>
        {detailsQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!detailsQuery.isLoading && detailsQuery.isError ? (
          <Alert severity="error">Non sono riuscito a caricare il dettaglio del mese.</Alert>
        ) : null}

        {!detailsQuery.isLoading && !detailsQuery.isError
          ? detailsQuery.data?.sections.map((section, index) => (
              <Box key={section.key}>
                {index > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                <AsideSection section={section} />
              </Box>
            ))
          : null}
      </AsideContentView>
    </>
  );
};
export default MonthlyStatsAsideContent;
