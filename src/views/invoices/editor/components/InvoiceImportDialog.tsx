import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { useInvoiceAvailableDocuments } from '~/proxies/aries-proxy/invoices';
import { InvoiceAvailableDocument, InvoiceDocumentKey, InvoiceDocumentType } from '~/types/aries-proxy/invoices';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { sameDocument } from '../invoiceFormValues';

const TYPE_LABELS: Record<InvoiceDocumentType, string> = {
  report: 'Rapporto',
  ddt: 'DDT',
  report_group: 'Resoconto',
};

type Filter = 'all' | InvoiceDocumentType;

interface Props {
  customerId: number;
  /** Documents already in the invoice: not proposed. */
  excluded: InvoiceDocumentKey[];
  importing: boolean;
  onImport: (document: InvoiceAvailableDocument) => void;
  onClose: () => void;
}

/**
 * "Documenti disponibili" of the Delphi editor: DDTs not invoiced, reports to invoice (not in a report group nor in a
 * job) and open report groups of the customer.
 */
const InvoiceImportDialog: React.FC<Props> = ({ customerId, excluded, importing, onImport, onClose }) => {
  const documentsQuery = useInvoiceAvailableDocuments(customerId);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const documents = useMemo(() => {
    const text = search.trim().toLowerCase();
    return (documentsQuery.data ?? [])
      .filter((document) => !excluded.some((item) => sameDocument(item, document)))
      .filter((document) => filter === 'all' || document.type === filter)
      .filter(
        (document) =>
          !text ||
          [document.number, document.causal, document.address, document.system, document.note]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(text)),
      );
  }, [documentsQuery.data, excluded, filter, search]);

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={importing ? undefined : onClose}>
      <DialogTitle>Importa documenti</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <Tabs value={filter} onChange={(_, value: Filter) => setFilter(value)} variant="scrollable">
              <Tab value="all" label="Tutti" />
              <Tab value="report" label="Rapporti" />
              <Tab value="ddt" label="DDT" />
              <Tab value="report_group" label="Resoconti" />
            </Tabs>
            <TextField
              size="small"
              label="Cerca"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </Stack>
          {documentsQuery.isError ? (
            <Alert severity="error">{getApiErrorMessage(documentsQuery.error, 'Documenti non disponibili.')}</Alert>
          ) : documentsQuery.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : documents.length === 0 ? (
            <Alert severity="info">Nessun documento da fatturare per il cliente.</Alert>
          ) : (
            <TableContainer sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Documento</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Causale / descrizione</TableCell>
                    <TableCell>Impianto / indirizzo</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={`${document.type}-${document.year}-${document.id}`} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            document.type === 'report_group'
                              ? (document.typeName ?? TYPE_LABELS.report_group)
                              : TYPE_LABELS[document.type]
                          }
                          sx={{ mr: 1 }}
                        />
                        {document.number ?? document.id}/{document.year}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {document.date
                          ? format(getDateByUnixtimestamp({ unixTimestamp: document.date }), 'dd/MM/yyyy')
                          : ''}
                      </TableCell>
                      <TableCell>{document.causal}</TableCell>
                      <TableCell>{document.system || document.address}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {document.note}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={importing}
                          onClick={() => onImport(document)}
                        >
                          Importa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {importing ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
        <Button onClick={onClose} disabled={importing}>
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceImportDialog;
