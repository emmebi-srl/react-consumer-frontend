import { useMemo, useState } from 'react';
import { Close, Download } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { importDdtDocument } from '~/proxies/aries-proxy/api/ddts';
import { useDdtAvailableDocuments } from '~/proxies/aries-proxy/ddts';
import { useReportsSearch } from '~/proxies/aries-proxy/reports';
import { DdtDocument } from '~/types/aries-proxy/ddts';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { DdtFormValues, toRowValues } from '../ddtFormValues';

const documentLabel = (document: DdtDocument) =>
  document.type === 'report'
    ? `Rapporto ${document.number || document.id}/${document.year}`
    : `Lista ${document.id}/${document.year}`;

interface Props {
  isNew: boolean;
}

/**
 * "Documenti" of the Delphi editor: reports (ddt_rapporto) and pick lists (lista_prelievo) of the customer.
 * Importing one adds its material to the rows, like TFDDTEditor.ImportReport and FillFormByWithdrawal.
 */
const DdtDocumentsCard: React.FC<Props> = ({ isNew }) => {
  const snackbar = useSnackbar();
  const { control, getValues, setValue } = useFormContext<DdtFormValues>();
  const reportLinks = useFieldArray({ control, name: 'reportLinks', keyName: 'fieldKey' });
  const pickLists = useFieldArray({ control, name: 'pickLists', keyName: 'fieldKey' });
  const recipient = useWatch({ control, name: 'recipient' });
  const isCustomer = useWatch({ control, name: 'isCustomer' });
  const jobLink = useWatch({ control, name: 'jobLink' });
  const signatureReport = useWatch({ control, name: 'signatureReport' });
  const customerId = isCustomer ? recipient?.id : undefined;
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const documentsQuery = useDdtAvailableDocuments(customerId, jobLink, open);
  const reportsQuery = useReportsSearch({ customerId, pageSize: 30 });
  const reports = useMemo(
    () => (customerId ? (reportsQuery.data?.pages.flatMap((page) => page.reports) ?? []) : []),
    [customerId, reportsQuery.data],
  );
  const linkable = reports.filter(
    (report) => !reportLinks.fields.some((link) => link.reportId === report.id && link.reportYear === report.year),
  );
  // Documents already in the form are not offered again.
  const documents = (documentsQuery.data ?? []).filter((document) =>
    document.type === 'report'
      ? !reportLinks.fields.some((link) => link.reportId === document.id && link.reportYear === document.year)
      : !pickLists.fields.some((list) => list.listId === document.id && list.year === document.year),
  );

  if (!isCustomer) return null;

  const importDocument = async (document: DdtDocument) => {
    setImporting(`${document.type}-${document.year}-${document.id}`);
    try {
      const data = (await importDdtDocument(document.type, document.year, document.id)).data;
      // setValue also refreshes the field array of the rows card.
      setValue('rows', [...getValues('rows'), ...data.rows.map(toRowValues)], { shouldDirty: true });
      if (document.type === 'report') {
        reportLinks.append({
          reportId: document.id,
          reportYear: document.year,
          reportNumber: document.number,
          date: document.date,
          systemId: data.systemId,
        });
      } else {
        pickLists.append({ listId: document.id, year: document.year, date: document.date });
      }
      // Delphi fills what the DDT doesn't have yet: destination, system, job lot.
      if (getValues('destinationId') === '' && data.destinationId) setValue('destinationId', data.destinationId);
      if (getValues('systemId') === '' && data.systemId) setValue('systemId', data.systemId);
      if (!getValues('jobLink') && data.jobLink) setValue('jobLink', data.jobLink, { shouldDirty: true });
      // TFDDTEditor.AddDDT copies the signatures of the imported report on the new DDT.
      if (isNew && data.hasSignatures && !getValues('signatureReport'))
        setValue('signatureReport', { reportId: document.id, reportYear: document.year });
      snackbar.success(`${documentLabel(document)}: ${data.rows.length} righe aggiunte`);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile importare il documento.'));
    } finally {
      setImporting(null);
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Documenti collegati"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheader="Il collegamento a un rapporto sposta le sue quantità di magazzino e commessa; la lista di prelievo viene chiusa dal DDT."
        subheaderTypographyProps={{ variant: 'caption' }}
        action={
          <Button startIcon={<Download />} disabled={!customerId} onClick={() => setOpen(true)} sx={{ mt: 0.5 }}>
            Importa materiale
          </Button>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {reportLinks.fields.map((link, index) => (
              <Chip
                key={link.fieldKey}
                label={`Rapporto ${link.reportNumber || link.reportId}/${link.reportYear}${
                  link.date ? ` del ${getStringDateByUnixtimestamp(link.date)}` : ''
                }`}
                onDelete={() => reportLinks.remove(index)}
                deleteIcon={<Close />}
              />
            ))}
            {pickLists.fields.map((list, index) => (
              <Chip
                key={list.fieldKey}
                color="secondary"
                variant="outlined"
                label={`Lista di prelievo ${list.listId}/${list.year}${
                  list.date ? ` del ${getStringDateByUnixtimestamp(list.date)}` : ''
                }`}
                onDelete={() => pickLists.remove(index)}
                deleteIcon={<Close />}
              />
            ))}
            {!reportLinks.fields.length && !pickLists.fields.length ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nessun documento collegato.
              </Typography>
            ) : null}
          </Stack>
          {signatureReport ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Al salvataggio le firme del rapporto {signatureReport.reportId}/{signatureReport.reportYear} vengono
              copiate sul DDT.
            </Typography>
          ) : null}
          <TextField
            select
            size="small"
            label="Collega un rapporto senza importare il materiale"
            value=""
            disabled={!customerId}
            onChange={(event) => {
              const report = linkable.find((item) => `${item.year}-${item.id}` === event.target.value);
              if (report) {
                reportLinks.append({
                  reportId: report.id,
                  reportYear: report.year,
                  reportNumber: report.reportNumber,
                  date: report.date,
                  systemId: report.systemId,
                  statusName: report.statusName,
                });
              }
            }}
            sx={{ maxWidth: 480 }}
          >
            {linkable.map((report) => (
              <MenuItem key={`${report.year}-${report.id}`} value={`${report.year}-${report.id}`}>
                {`${report.reportNumber || report.id}/${report.year} - ${getStringDateByUnixtimestamp(report.date)}${
                  report.statusName ? ` - ${report.statusName}` : ''
                }`}
              </MenuItem>
            ))}
            {!linkable.length ? <MenuItem disabled>Nessun rapporto disponibile</MenuItem> : null}
          </TextField>
        </Stack>
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Importa materiale</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Rapporti eseguiti non ancora in un DDT né fatturati, e liste di prelievo aperte del cliente
            {jobLink ? ' (solo i rapporti della commessa scelta)' : ''}.
          </Typography>
          {documentsQuery.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : documents.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Causale</TableCell>
                  <TableCell>Indirizzo</TableCell>
                  <TableCell>Impianto / note</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => {
                  const key = `${document.type}-${document.year}-${document.id}`;
                  return (
                    <TableRow key={key} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{documentLabel(document)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {document.date ? getStringDateByUnixtimestamp(document.date) : ''}
                      </TableCell>
                      <TableCell>{document.causal}</TableCell>
                      <TableCell>{document.address}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {[document.system, document.note].filter(Boolean).join(' · ')}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={importing !== null}
                          startIcon={importing === key ? <CircularProgress size={14} /> : undefined}
                          onClick={() => void importDocument(document)}
                        >
                          Importa
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nessun documento da importare.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DdtDocumentsCard;
