import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import InvoicePaymentModal from '~/components/Modals/InvoicePaymentModal';
import SupplierInvoicePaymentModal from '~/components/Modals/SupplierInvoicePaymentModal';
import { useModal } from '~/modals/Modal';
import { useDashboardMonthlyCashflowDetails } from '~/proxies/aries-proxy/dashboard';
import { RouteConfig } from '~/routes/routeConfig';
import { DashboardAsideItem, DashboardAsideSection } from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import { SelectedMonthlyCashflow } from '../state';

interface MonthlyCashflowAsideContentProps {
  item: SelectedMonthlyCashflow;
}

const getCounterpartLink = (item: DashboardAsideItem) => {
  if (item.counterpartType === 'customer' && item.counterpartId) {
    return RouteConfig.CustomerDetail.buildLink({ customerId: item.counterpartId.toString() });
  }

  return undefined;
};

const getSectionTitle = (section: DashboardAsideSection) => {
  if (section.key === 'invoice-payments') {
    return 'Fatture';
  }

  if (section.key === 'supplier-invoice-payments') {
    return 'Fatture fornitori';
  }

  return section.title;
};

const getStatusLabel = (sectionKey: string, isOpen: boolean) => {
  if (sectionKey === 'invoice-payments') {
    return isOpen ? 'Da incassare' : 'Incassata';
  }

  if (sectionKey === 'supplier-invoice-payments') {
    return isOpen ? 'Da pagare' : 'Pagata';
  }

  return isOpen ? 'Aperto' : 'Chiuso';
};

const CashflowRow: React.FC<{
  item: DashboardAsideItem;
  onMarkAsPaid: (item: DashboardAsideItem, sectionKey: string) => void;
  sectionKey: string;
}> = ({ item, onMarkAsPaid, sectionKey }) => {
  const date = getDateByUnixtimestamp({ unixTimestamp: item.date });
  const statusLabel = getStatusLabel(sectionKey, item.isOpen);
  const counterpartLink = getCounterpartLink(item);
  const canMarkAsPaid = item.isOpen && !!item.paymentId;

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
            label={statusLabel}
            size="small"
            variant={item.isOpen ? 'filled' : 'outlined'}
          />
          <Typography fontWeight={700} variant="body2">
            {formatMoney(newMoney(item.amount ?? 0, 'EUR'))}
          </Typography>
          {canMarkAsPaid ? (
            <Button
              onClick={() => onMarkAsPaid(item, sectionKey)}
              size="small"
              startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
              variant="outlined"
            >
              Segna pagato
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

const AsideSection: React.FC<{
  onMarkAsPaid: (item: DashboardAsideItem, sectionKey: string) => void;
  section: DashboardAsideSection;
}> = ({ onMarkAsPaid, section }) => (
  <Box>
    <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography fontWeight={700} variant="subtitle1">
        {getSectionTitle(section)}
      </Typography>
      <Typography color="text.secondary" variant="caption">
        {section.items.length}
      </Typography>
    </Stack>

    {section.items.length > 0 ? (
      section.items.map((item) => (
        <CashflowRow
          key={`${section.key}-${item.year}-${item.id}-${item.paymentId ?? 'no-payment'}`}
          item={item}
          onMarkAsPaid={onMarkAsPaid}
          sectionKey={section.key}
        />
      ))
    ) : (
      <Alert severity="info">Nessuno scaduto aperto nel mese selezionato.</Alert>
    )}

    {section.hasMore && section.moreUrl ? (
      <Button component={RouterLink} size="small" sx={{ mt: 1.25 }} to={section.moreUrl} variant="text">
        Vedi altro
      </Button>
    ) : null}
  </Box>
);

const MonthlyCashflowAsideContent: React.FC<MonthlyCashflowAsideContentProps> = ({ item }) => {
  const modal = useModal();
  const detailsQuery = useDashboardMonthlyCashflowDetails({ month: item.month, year: item.year });
  const monthDate = new Date(item.year, item.month - 1, 1);

  const openPaymentModal = (payment: DashboardAsideItem, sectionKey: string) => {
    if (!payment.paymentId) return;

    const modalProps = {
      counterpartName: payment.counterpartName,
      id: payment.id,
      paymentId: payment.paymentId,
      title: payment.title,
      year: payment.year,
    };

    if (sectionKey === 'supplier-invoice-payments') {
      void modal.showModal({
        component: SupplierInvoicePaymentModal,
        props: modalProps,
      });
      return;
    }

    void modal.showModal({
      component: InvoicePaymentModal,
      props: modalProps,
    });
  };

  return (
    <>
      <AsideSummaryView title="Scadenze aperte" subtitle={format(monthDate, 'MMMM yyyy', { locale: it })} />
      <AsideContentView sx={{ flexDirection: 'column', gap: 3, overflowY: 'scroll' }}>
        {detailsQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!detailsQuery.isLoading && detailsQuery.isError ? (
          <Alert severity="error">Non sono riuscito a caricare il dettaglio cashflow.</Alert>
        ) : null}

        {!detailsQuery.isLoading && !detailsQuery.isError
          ? detailsQuery.data?.sections.map((section, index) => (
              <Box key={section.key}>
                {index > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                <AsideSection onMarkAsPaid={openPaymentModal} section={section} />
              </Box>
            ))
          : null}
      </AsideContentView>
    </>
  );
};
export default MonthlyCashflowAsideContent;
