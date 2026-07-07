import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import SplitAside from '~/components/Layout/SplitAside';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { useReportById } from '~/proxies/aries-proxy/reports';
import { RouteConfig } from '~/routes/routeConfig';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { useActiveId, useIsSidebarOpen, useResetSelection } from '../state';

const parseReportSelectionId = (activeId: string | null) => {
  if (!activeId) return null;
  const [year, reportId] = activeId.split(':').map(Number);
  if (!year || !reportId) return null;
  return { reportId, year };
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value || '-'}</Typography>
  </Box>
);

const ReportAside = () => {
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();
  const reset = useResetSelection();
  const selection = parseReportSelectionId(activeId);
  const reportQuery = useReportById(selection?.year ?? 0, selection?.reportId ?? 0);
  const report = reportQuery.data?.reports[0];

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={620}>
      <AsideSummaryView
        title={report ? `Rapporto ${report.id}/${report.year}` : 'Rapporto'}
        subtitle={report ? getStringDateByUnixtimestamp(report.date) : 'Caricamento...'}
      />
      <AsideContentView sx={{ gap: 3, overflowY: 'auto' }}>
        {reportQuery.isLoading ? (
          <Stack alignItems="center" justifyContent="center" minHeight={180}>
            <CircularProgress />
          </Stack>
        ) : null}
        {reportQuery.isError ? <Alert severity="error">Impossibile caricare il rapporto.</Alert> : null}
        {report ? (
          <>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip label={`Stato: ${report.statusName ?? report.statusId}`} />
              <Chip label={`Cliente: ${report.customerId}`} />
              <Chip label={`Impianto: ${report.systemId}`} />
              {report.isInvoiced ? <Chip color="success" label="Fatturato" /> : null}
            </Stack>

            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                component={RouterLink}
                to={RouteConfig.ReportEdit.buildLink({ reportId: report.id.toString(), year: report.year.toString() })}
                startIcon={<Edit />}
                variant="contained"
              >
                Modifica
              </Button>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <DetailRow label="Richiesto da" value={report.requestedBy} />
              <DetailRow label="Responsabile" value={report.responsible} />
              <DetailRow label="Mansione" value={report.responsibleJob} />
              <DetailRow label="Numero rapporto" value={report.reportNumber} />
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2">Relazione tecnica</Typography>
              <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                {report.technicalReport || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Note in evidenza</Typography>
              <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                {report.notesHighlights || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Appunti tecnico</Typography>
              <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                {report.technicianNotes || '-'}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" gap={4} flexWrap="wrap">
              <DetailRow label="Prezzo" value={`${report.price.toFixed(2)} EUR`} />
              <DetailRow label="Costo" value={`${report.cost.toFixed(2)} EUR`} />
              <DetailRow label="Allegati" value={report.attachmentsCount} />
            </Stack>
          </>
        ) : null}
      </AsideContentView>
    </SplitAside>
  );
};

export default ReportAside;
