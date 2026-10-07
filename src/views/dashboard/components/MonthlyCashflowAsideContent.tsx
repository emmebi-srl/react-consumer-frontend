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

  if (item.counterpartType === 'supplier' && item.counterpartId) {
    return RouteConfig.SupplierDetail.buildLink({ supplierId: item.counterpartId.toString() });
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

  if (section.key === 'scheduled-supplier-invoice-payments') {
    return 'Fatture fornitori programmate';
  }

  if (section.key === 'invoice-prepayments') {
    return 'Acconti fatture';
  }

  if (section.key === 'supplier-invoice-prepayments') {
    return 'Acconti fatture fornitori';
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

  if (sectionKey === 'scheduled-supplier-invoice-payments') {
    return 'Programmata';
  }

  if (sectionKey === 'invoice-prepayments' || sectionKey === 'supplier-invoice-prepayments') {
    return 'Registrato';
  }

  return isOpen ? 'Aperto' : 'Chiuso';
};

const getEmptySectionMessage = (sectionKey: string) => {
  if (sectionKey === 'scheduled-supplier-invoice-payments') {
    return 'Nessuna fattura fornitore programmata nel mese selezionato.';
  }

  return 'Nessuno scaduto aperto nel mese selezionato.';
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
            label={statusLabel}
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
          {canMarkAsPaid ? (
            <Button
              onClick={() => onMarkAsPaid(item, sectionKey)}
              size="small"
              startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
              variant="outlined"
            >
              {sectionKey === 'invoice-payments' ? 'Segna come incassato' : 'Segna come pagato'}
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
        {getSectionTitle(section)}
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
        <CashflowRow
          key={`${section.key}-${item.year}-${item.id}-${item.paymentId ?? 'no-payment'}-${item.date}`}
          item={item}
          onMarkAsPaid={onMarkAsPaid}
          sectionKey={section.key}
        />
      ))
    ) : (
      <Alert severity="info">{getEmptySectionMessage(section.key)}</Alert>
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
