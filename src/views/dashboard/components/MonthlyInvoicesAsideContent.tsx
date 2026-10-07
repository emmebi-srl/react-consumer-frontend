import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { useDashboardMonthlyInvoicesDetails } from '~/proxies/aries-proxy/dashboard';
import { RouteConfig } from '~/routes/routeConfig';
import { DashboardAsideItem, DashboardAsideSection } from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import { SelectedMonthlyInvoices } from '../state';

interface MonthlyInvoicesAsideContentProps {
  item: SelectedMonthlyInvoices;
}

const getCounterpartLink = (item: DashboardAsideItem) => {
  if (item.counterpartType === 'customer' && item.counterpartId) {
    return RouteConfig.CustomerDetail.buildLink({ customerId: item.counterpartId.toString() });
  }

  if (item.counterpartType === 'supplier' && item.counterpartId) {
    return RouteConfig.SupplierDetail.buildLink({ supplierId: item.counterpartId.toString() });
  }

  return undefined;
};

const getStatusLabel = (sectionKey: string, isOpen: boolean) => {
  if (sectionKey === 'preinvoices') {
    return isOpen ? 'Aperta' : 'Chiusa';
  }

  return isOpen ? 'Aperta' : 'Chiusa';
};

const InvoiceRow: React.FC<{ item: DashboardAsideItem; sectionKey: string }> = ({ item, sectionKey }) => {
  const date = getDateByUnixtimestamp({ unixTimestamp: item.date });
  const counterpartLink = getCounterpartLink(item);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 1.25 }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {item.counterpartName ? (
            counterpartLink ? (
              <Typography
                component={RouterLink}
                to={counterpartLink}
                variant="body1"
                sx={{
                  color: 'text.primary',
                  display: 'block',
                  fontWeight: 600,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textDecoration: 'underline',
                }}
              >
                {item.counterpartName}
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  display: 'block',
                  fontWeight: 600,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.counterpartName}
              </Typography>
            )
          ) : null}
          <Typography
            color={item.counterpartName ? 'text.secondary' : 'text.primary'}
            noWrap
            variant={item.counterpartName ? 'body2' : 'body1'}
            sx={{
              fontWeight: item.counterpartName ? undefined : 600,
            }}
          >
            {item.title}
          </Typography>
          {item.subtitle ? (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.subtitle}
            </Typography>
          ) : null}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {format(date, 'dd MMM yyyy', { locale: it })}
          </Typography>
        </Box>
        <Stack
          spacing={0.75}
          sx={{
            alignItems: 'flex-end',
          }}
        >
          <Chip
            color={item.isOpen ? 'warning' : 'default'}
            label={getStatusLabel(sectionKey, item.isOpen)}
            size="small"
            variant={item.isOpen ? 'filled' : 'outlined'}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
            }}
          >
            {formatMoney(newMoney(item.amount ?? 0, 'EUR'))}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const AsideSection: React.FC<{ section: DashboardAsideSection }> = ({ section }) => (
  <Box>
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
        }}
      >
        {section.title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
        }}
      >
        {section.items.length}
      </Typography>
    </Stack>

    {section.items.length > 0 ? (
      section.items.map((item) => (
        <InvoiceRow key={`${section.key}-${item.year}-${item.id}`} item={item} sectionKey={section.key} />
      ))
    ) : (
      <Alert severity="info">Nessuna fattura nel mese selezionato.</Alert>
    )}

    {section.hasMore && section.moreUrl ? (
      <Button component={RouterLink} size="small" sx={{ mt: 1.25 }} to={section.moreUrl} variant="text">
        Vedi altro
      </Button>
    ) : null}
  </Box>
);

const MonthlyInvoicesAsideContent: React.FC<MonthlyInvoicesAsideContentProps> = ({ item }) => {
  const detailsQuery = useDashboardMonthlyInvoicesDetails({ month: item.month, year: item.year });
  const monthDate = new Date(item.year, item.month - 1, 1);

  return (
    <>
      <AsideSummaryView title="Dettaglio fatture" subtitle={format(monthDate, 'MMMM yyyy', { locale: it })} />
      <AsideContentView sx={{ flexDirection: 'column', gap: 3, overflowY: 'scroll' }}>
        {detailsQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!detailsQuery.isLoading && detailsQuery.isError ? (
          <Alert severity="error">Non sono riuscito a caricare il dettaglio fatture.</Alert>
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

export default MonthlyInvoicesAsideContent;
