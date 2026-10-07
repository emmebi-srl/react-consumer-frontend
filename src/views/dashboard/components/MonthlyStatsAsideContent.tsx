import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import { PictureAsPdf } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import { useModal } from '~/modals/Modal';
import { useDashboardMonthlyStatsDetails } from '~/proxies/aries-proxy/dashboard';
import { useInvoicePdf } from '~/proxies/aries-proxy/invoices';
import { useQuotePdf } from '~/proxies/aries-proxy/quotes';
import { useReportGroupPdf } from '~/proxies/aries-proxy/report-groups';
import { useReportPdf } from '~/proxies/aries-proxy/reports';
import { RouteConfig } from '~/routes/routeConfig';
import { DashboardAsideItem, DashboardAsideSection } from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import useSnackbar from '~/hooks/useSnackbar';
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

const ItemRow: React.FC<{ item: DashboardAsideItem; sectionKey: string }> = ({ item, sectionKey }) => {
  const date = getDateByUnixtimestamp({ unixTimestamp: item.date });
  const counterpartLink = getCounterpartLink(item);
  const modal = useModal();
  const snackbar = useSnackbar();
  const quotePdf = useQuotePdf();
  const reportGroupPdf = useReportGroupPdf();
  const reportPdf = useReportPdf();
  const invoicePdf = useInvoicePdf();

  const pdfMutationBySectionKey: Record<string, typeof quotePdf> = {
    'report-groups': reportGroupPdf,
    reports: reportPdf,
    invoices: invoicePdf,
    quotes: quotePdf,
  };
  const pdfMutation = pdfMutationBySectionKey[sectionKey];

  const onViewPdfClick = () => {
    if (!pdfMutation) return;

    pdfMutation.mutate(
      { id: item.id, year: item.year },
      {
        onSuccess: (pdf) => {
          modal.showModal({ component: PdfPreviewModal, props: { pdf, title: item.title } });
        },
        onError: () => {
          snackbar.error('PDF non disponibile per questo documento.');
        },
      },
    );
  };

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
            {`${item.title} del ${format(date, 'dd/MM/yyyy')}`}
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
        </Box>
        <Stack
          spacing={0.75}
          sx={{
            alignItems: 'flex-end',
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
            }}
          >
            {pdfMutation ? (
              <Button
                color="primary"
                loading={pdfMutation.isPending}
                onClick={onViewPdfClick}
                size="small"
                startIcon={<PictureAsPdf fontSize="small" />}
                sx={{ minWidth: 0, px: 1, py: 0.25 }}
                variant="outlined"
              >
                PDF
              </Button>
            ) : null}
            <Chip
              color={item.isOpen ? 'warning' : 'default'}
              label={item.isOpen ? 'Aperto' : 'Chiuso'}
              size="small"
              variant={item.isOpen ? 'filled' : 'outlined'}
            />
          </Stack>
          {typeof item.amount === 'number' ? (
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
              }}
            >
              {formatMoney(newMoney(item.amount, 'EUR'))}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

const AsideSection: React.FC<{ section: DashboardAsideSection }> = ({ section }) => {
  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          mb: 1,
          position: 'sticky',
          px: 1.5,
          py: 0.75,
          top: 0,

          // Forces its own compositing layer so it doesn't flicker/render behind
          // scrolled content in Chromium when a sticky element sits inside an
          // ancestor with a CSS transform (SplitAside wraps this view in <Slide>).
          transform: 'translateZ(0)',

          zIndex: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {section.title}
        </Typography>
        <Chip
          label={section.totalCount}
          size="small"
          sx={{ bgcolor: 'primary.contrastText', color: 'primary.main', fontWeight: 700 }}
        />
      </Stack>

      {section.items.length > 0 ? (
        section.items.map((item) => (
          <ItemRow item={item} key={`${section.key}-${item.year}-${item.id}`} sectionKey={section.key} />
        ))
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
};

const MonthlyStatsAsideContent: React.FC<MonthlyStatsAsideContentProps> = ({ item }) => {
  const detailsQuery = useDashboardMonthlyStatsDetails({ month: item.month, year: item.year });
  const monthDate = new Date(item.year, item.month - 1, 1);

  return (
    <>
      <AsideSummaryView title="Dettaglio documenti" subtitle={format(monthDate, 'MMMM yyyy', { locale: it })} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        {/*
          Masks the seam where a sticky section band snaps into place at the top of the
          scroll box: absolute here (not inside AsideContentView, which scrolls) so it stays
          fixed over the band instead of scrolling away with the content.
        */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            height: 24,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 3,
          }}
        />
        <AsideContentView sx={{ flex: '1 1 auto', flexDirection: 'column', gap: 3, minHeight: 0, overflowY: 'scroll' }}>
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
      </Box>
    </>
  );
};
export default MonthlyStatsAsideContent;
