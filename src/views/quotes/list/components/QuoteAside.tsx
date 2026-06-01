import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, OpenInNew } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import SplitAside from '~/components/Layout/SplitAside';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { useCreateNextQuoteRevision, useDeleteQuoteLot, useQuoteById } from '~/proxies/aries-proxy/quotes';
import { RouteConfig } from '~/routes/routeConfig';
import { QuoteItem, QuoteLot } from '~/types/aries-proxy/quotes';
import { formatMoney, newMoney } from '~/utils/money';
import { useActiveId, useIsSidebarOpen, useResetSelection } from '../state';

const parseQuoteSelectionId = (activeId: string | null) => {
  if (!activeId) return null;
  const [year, quoteId] = activeId.split(':').map(Number);
  if (!year || !quoteId) return null;
  return { quoteId, year };
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/D';
  return new Intl.DateTimeFormat('it-IT').format(new Date(value));
};

const itemTotal = (item: QuoteItem) => {
  const quantity = Number(item.quantity ?? 0);
  const product = Number(item.price ?? 0) * quantity;
  const labor = item.mounted ? (Number(item.installationTime ?? 0) / 60) * Number(item.hourPrice ?? 0) * quantity : 0;
  return product + labor;
};

const lotTotal = (lot: QuoteLot) => (lot.items ?? []).reduce((sum, item) => sum + itemTotal(item), 0);

const LotRows: React.FC<{ quoteId: number; year: number; revisionId: number; lots: QuoteLot[] }> = ({
  lots,
  quoteId,
  revisionId,
  year,
}) => {
  const deleteLot = useDeleteQuoteLot();

  const handleDelete = (lot: QuoteLot) => {
    if (!window.confirm(`Eliminare il lotto ${lot.position}?`)) return;
    deleteLot.mutate({ id: quoteId, position: lot.position, revisionId, year });
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Pos.</TableCell>
          <TableCell>Lotto</TableCell>
          <TableCell align="right">Totale</TableCell>
          <TableCell align="right">Azioni</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lots.map((lot) => (
          <TableRow key={lot.position}>
            <TableCell>{lot.position}</TableCell>
            <TableCell>
              <Stack spacing={0.5}>
                <Typography variant="body2">{lot.lotName || `Lotto ${lot.lotId}`}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {lot.optional ? <Chip label="Opzionale" color="warning" size="small" /> : null}
                  <Chip label={`${lot.items?.length ?? 0} righe`} size="small" />
                </Stack>
              </Stack>
            </TableCell>
            <TableCell align="right">{formatMoney(newMoney(lotTotal(lot)))}</TableCell>
            <TableCell align="right">
              <Tooltip title="Modifica lotto">
                <IconButton
                  component={RouterLink}
                  to={RouteConfig.QuoteLotEdit.buildLink({
                    lotPosition: String(lot.position),
                    quoteId: String(quoteId),
                    revisionId: String(revisionId),
                    year: String(year),
                  })}
                  size="small"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Elimina lotto">
                <IconButton color="error" size="small" onClick={() => handleDelete(lot)} disabled={deleteLot.isPending}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const QuoteAside = () => {
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();
  const reset = useResetSelection();
  const selection = parseQuoteSelectionId(activeId);
  const createRevision = useCreateNextQuoteRevision();

  const quoteQuery = useQuoteById(selection?.year ?? 0, selection?.quoteId ?? 0, {
    includes: 'revisions,revisions.customer,revisions.destination,revisions.lots,revisions.lots.items,status,type',
  });

  const quote = quoteQuery.data?.quotes[0];
  const revisions = quote?.revisions ?? [];
  const currentRevision = revisions.find((revision) => revision.id === quote?.revisionId) ?? revisions[0];
  const lots = currentRevision?.lots ?? [];

  const handleNewRevision = () => {
    if (!selection) return;
    createRevision.mutate({ id: selection.quoteId, year: selection.year });
  };

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={680}>
      <AsideSummaryView
        title={quote ? `Preventivo ${quote.id}/${quote.year}` : 'Preventivo'}
        subtitle={currentRevision?.customer?.companyName ?? 'Caricamento...'}
      />
      <AsideContentView sx={{ flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {quoteQuery.isLoading ? (
          <Stack alignItems="center" justifyContent="center" minHeight={180}>
            <CircularProgress />
          </Stack>
        ) : null}

        {quoteQuery.isError ? <Alert severity="error">Impossibile caricare il preventivo.</Alert> : null}

        {quote && currentRevision ? (
          <>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip label={`Stato: ${quote.status?.name ?? quote.statusId ?? 'N/D'}`} />
              <Chip label={`Tipo: ${quote.quoteType?.name ?? quote.quoteTypeId}`} />
              <Chip label={`Rev. corrente: ${currentRevision.id}`} />
            </Stack>

            <Box>
              <Typography variant="subtitle2">Oggetto</Typography>
              <Typography variant="body2" color="text.secondary">
                {currentRevision.subject || quote.note || 'Nessuna nota'}
              </Typography>
            </Box>

            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                component={RouterLink}
                to={RouteConfig.QuoteDetail.buildLink({ quoteId: String(quote.id), year: String(quote.year) })}
                startIcon={<OpenInNew />}
                variant="outlined"
              >
                Dettaglio
              </Button>
              <Button
                component={RouterLink}
                to={RouteConfig.QuoteRevisionEdit.buildLink({
                  quoteId: String(quote.id),
                  revisionId: String(currentRevision.id),
                  year: String(quote.year),
                })}
                startIcon={<Edit />}
                variant="contained"
              >
                Modifica revisione
              </Button>
              <Button onClick={handleNewRevision} disabled={createRevision.isPending} variant="outlined">
                Nuova revisione
              </Button>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Lotti</Typography>
                <Button
                  component={RouterLink}
                  to={RouteConfig.QuoteLotNew.buildLink({
                    quoteId: String(quote.id),
                    revisionId: String(currentRevision.id),
                    year: String(quote.year),
                  })}
                  startIcon={<Add />}
                  size="small"
                  variant="contained"
                >
                  Aggiungi
                </Button>
              </Stack>
              {lots.length > 0 ? (
                <LotRows lots={lots} quoteId={quote.id} revisionId={currentRevision.id} year={quote.year} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessun lotto presente.
                </Typography>
              )}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="h6">Revisioni</Typography>
              {revisions.map((revision) => (
                <Stack key={revision.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    Rev. {revision.id} - {formatDate(revision.revisionDate ?? revision.createdAt)}
                  </Typography>
                  <Chip label={`${revision.lots?.length ?? 0} lotti`} size="small" />
                </Stack>
              ))}
            </Stack>
          </>
        ) : null}
      </AsideContentView>
    </SplitAside>
  );
};

export default QuoteAside;
