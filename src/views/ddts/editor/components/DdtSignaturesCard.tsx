import { useState } from 'react';
import { Delete } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import {
  useCopyDdtSignaturesFromReport,
  useDdtSignature,
  useRemoveDdtSignature,
  useSetDdtDriverSignatureFromEmployee,
} from '~/proxies/aries-proxy/ddts';
import { useEmployees } from '~/proxies/aries-proxy/employees';
import { Ddt, DdtSignatureKind } from '~/types/aries-proxy/ddts';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface SignatureBoxProps {
  ddt: Ddt;
  kind: DdtSignatureKind;
  title: string;
  present: boolean;
  canEdit: boolean;
}

const SignatureBox: React.FC<SignatureBoxProps> = ({ ddt, kind, title, present, canEdit }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const imageQuery = useDdtSignature(ddt.year, ddt.id, kind, present);
  const removeMutation = useRemoveDdtSignature();

  const remove = async () => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Rimuovi firma', text: `Rimuovere la ${title.toLowerCase()} dal DDT?` },
    });
    if (answer.action !== 'YES') return;
    try {
      await removeMutation.mutateAsync({ year: ddt.year, id: ddt.id, kind });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile rimuovere la firma.'));
    }
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="overline">{title}</Typography>
        {present && canEdit ? (
          <Tooltip title="Rimuovi firma">
            <IconButton size="small" color="error" onClick={() => void remove()} disabled={removeMutation.isPending}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <Stack sx={{ height: 90, alignItems: 'center', justifyContent: 'center' }}>
        {!present ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nessuna firma
          </Typography>
        ) : imageQuery.isLoading ? (
          <CircularProgress size={24} />
        ) : imageQuery.data ? (
          <Box component="img" src={imageQuery.data} alt={title} sx={{ maxHeight: 90, maxWidth: '100%' }} />
        ) : (
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            File della firma non trovato
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

interface Props {
  ddt: Ddt;
  canEdit: boolean;
}

/**
 * Signatures printed on the DDT, like the "Firma" menu of the Delphi DDT list: from a linked report
 * (customer and technician signatures) or the driver signature of an employee.
 */
const DdtSignaturesCard: React.FC<Props> = ({ ddt, canEdit }) => {
  const snackbar = useSnackbar();
  const employeesQuery = useEmployees();
  const fromReport = useCopyDdtSignaturesFromReport();
  const fromEmployee = useSetDdtDriverSignatureFromEmployee();
  const [busy, setBusy] = useState(false);
  const reports = ddt.reportLinks ?? [];

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      snackbar.success(done);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile impostare la firma.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Firme"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheader="Stampate nel PDF del DDT."
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SignatureBox
              ddt={ddt}
              kind="driver"
              title="Firma conducente"
              present={ddt.hasDriverSignature}
              canEdit={canEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SignatureBox
              ddt={ddt}
              kind="recipient"
              title="Firma destinatario"
              present={ddt.hasRecipientSignature}
              canEdit={canEdit}
            />
          </Grid>
        </Grid>
        {canEdit ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              size="small"
              label="Copia le firme da un rapporto collegato"
              value=""
              disabled={busy || !reports.length}
              helperText={
                reports.length ? 'Cliente → destinatario, tecnico → conducente' : 'Nessun rapporto collegato salvato'
              }
              onChange={(event) => {
                const report = reports.find((item) => `${item.reportYear}-${item.reportId}` === event.target.value);
                if (report)
                  void run(
                    () =>
                      fromReport.mutateAsync({
                        year: ddt.year,
                        id: ddt.id,
                        reportId: report.reportId,
                        reportYear: report.reportYear,
                      }),
                    'Firme copiate dal rapporto',
                  );
              }}
              sx={{ minWidth: 300 }}
            >
              {reports.map((report) => (
                <MenuItem
                  key={`${report.reportYear}-${report.reportId}`}
                  value={`${report.reportYear}-${report.reportId}`}
                >
                  Rapporto {report.reportNumber || report.reportId}/{report.reportYear}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Firma conducente di un dipendente"
              value=""
              disabled={busy || !employeesQuery.data}
              onChange={(event) => {
                const employeeId = Number(event.target.value);
                if (employeeId)
                  void run(
                    () => fromEmployee.mutateAsync({ year: ddt.year, id: ddt.id, employeeId }),
                    'Firma del dipendente impostata',
                  );
              }}
              sx={{ minWidth: 300 }}
            >
              {(employeesQuery.data ?? []).map((employee) => (
                <MenuItem key={employee.employeeId} value={employee.employeeId}>
                  {employee.companyName ?? `Dipendente ${employee.employeeId}`}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DdtSignaturesCard;
