import { useState } from 'react';
import { Delete, Edit, Email, PictureAsPdf } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import SplitAside from '~/components/Layout/SplitAside';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import EmailComposeModal from '~/components/Modals/EmailComposeModal';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getCustomerById } from '~/proxies/aries-proxy/api/customers';
import { getDdtPdf } from '~/proxies/aries-proxy/api/ddts';
import {
  useCarriers,
  useDdtById,
  useDeleteDdt,
  useDeliveryCares,
  useDeliveryMethods,
} from '~/proxies/aries-proxy/ddts';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { Ddt, DDT_ASPECTS, DdtDestination, DdtRow } from '~/types/aries-proxy/ddts';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateByUnixtimestamp, getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import { decodeRtf } from '~/utils/rtf-utils';
import { parseDdtSelectionId, useActiveId, useIsSidebarOpen, useResetSelection } from '../state';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

/** Delphi writes some texts (row notes) as RTF. */
const toText = (value?: string | null) => {
  if (!value) return '';
  return value.trimStart().startsWith('{\\rtf') ? decodeRtf(value) : value;
};

const formatDestination = (destination?: DdtDestination | null) => {
  if (!destination) return '';
  const street = [destination.street, destination.houseNumber].filter(Boolean).join(' ');
  const town = [destination.postalCode, destination.municipality].filter(Boolean).join(' ');
  return [street, destination.province ? `${town} (${destination.province})` : town].filter(Boolean).join(', ');
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const DetailGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>{children}</Box>
);

const RowsTable: React.FC<{ rows: DdtRow[]; showPrices: boolean }> = ({ rows, showPrices }) => {
  if (!rows.length)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nessuna riga
      </Typography>
    );
  const total = rows.reduce((sum, row) => sum + (row.quantity ?? 0) * row.price, 0);
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Articolo</TableCell>
          <TableCell align="right">Q.tà</TableCell>
          {showPrices ? <TableCell align="right">Prezzo</TableCell> : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={row.position ?? index}>
            <TableCell sx={{ maxWidth: 0, width: '100%' }}>
              {row.productCode ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {row.productCode}
                  {row.serialNumber ? ` · S/N ${row.serialNumber}` : ''}
                </Typography>
              ) : null}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {toText(row.description) || '-'}
              </Typography>
              {row.kitComponents?.length ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Kit: {row.kitComponents.map((component) => component.productCode).join(', ')}
                </Typography>
              ) : null}
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
              {row.quantity ?? ''} {row.quantity != null ? (row.measureUnit ?? '') : ''}
            </TableCell>
            {showPrices ? (
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {row.productCode || row.price ? toEuro(row.price) : ''}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
        {showPrices ? (
          <TableRow>
            <TableCell colSpan={2} align="right">
              <Typography variant="subtitle2">Totale</Typography>
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
              <Typography variant="subtitle2">{toEuro(total)}</Typography>
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
};

const DdtActions: React.FC<{ ddt: Ddt }> = ({ ddt }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const resetSelection = useResetSelection();
  const { permission } = useModulePermission(AriesModule.Ddts);
  const deleteMutation = useDeleteDdt();
  const [busy, setBusy] = useState<'pdf' | 'email' | null>(null);
  const editorLink = RouteConfig.DdtDetail.buildLink({ year: String(ddt.year), ddtId: String(ddt.id) });

  const loadPdf = async () => new Blob([(await getDdtPdf(ddt.year, ddt.id)).data], { type: 'application/pdf' });

  const showPdf = async () => {
    setBusy('pdf');
    try {
      const pdf = await loadPdf();
      modal.showModal({ component: PdfPreviewModal, props: { pdf, title: `DDT ${ddt.id}/${ddt.year}` } });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare il PDF.'));
    } finally {
      setBusy(null);
    }
  };

  // Like "Invia" of the Delphi DDT list: PDF attached, subject "Invio DDT n<number> <year>".
  const sendEmail = async () => {
    setBusy('email');
    try {
      const pdf = await loadPdf();
      let to = '';
      if (ddt.customerId && !ddt.supplierId) {
        try {
          const customer = (await getCustomerById(ddt.customerId, { includes: 'contacts' })).data.customers.at(0);
          const main = customer?.contacts?.find((contact) => contact.isMain || contact.contactId === 1);
          to = main?.email?.trim() ?? '';
        } catch {
          // The address is only a suggestion: the email can still be written.
        }
      }
      modal.showModal({
        component: EmailComposeModal,
        props: {
          initialTo: to,
          initialSubject: `Invio DDT n${ddt.id} ${ddt.year}`,
          initialFiles: [new File([pdf], `DDT ${ddt.id} ${ddt.year}.pdf`, { type: 'application/pdf' })],
        },
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare il PDF.'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina DDT',
        text: `Eliminare il DDT ${ddt.id}/${ddt.year}? Le righe articolo vengono tolte dai movimenti di magazzino${
          ddt.jobLink ? ' e le quantità tornano alla commessa' : ''
        }; le liste di prelievo tornano aperte.`,
        alertText: ddt.invoiceId ? `Il DDT è già fatturato (fattura ${ddt.invoiceId}/${ddt.invoiceYear}).` : undefined,
        alertSeverity: 'warning',
      },
    });
    if (answer.action !== 'YES') return;
    try {
      await deleteMutation.mutateAsync({ year: ddt.year, id: ddt.id });
      snackbar.success('DDT eliminato');
      resetSelection();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare il DDT.'));
    }
  };

  return (
    <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
      <Button component={RouterLink} to={editorLink} variant="contained" startIcon={<Edit />}>
        {permission?.canEdit ? 'Modifica' : 'Apri'}
      </Button>
      {permission?.canPrint ? (
        <>
          <Button
            variant="outlined"
            startIcon={busy === 'pdf' ? <CircularProgress size={16} /> : <PictureAsPdf />}
            onClick={() => void showPdf()}
            disabled={!!busy}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={busy === 'email' ? <CircularProgress size={16} /> : <Email />}
            onClick={() => void sendEmail()}
            disabled={!!busy}
          >
            Email
          </Button>
        </>
      ) : null}
      {permission?.canDelete ? (
        <Button
          color="error"
          variant="text"
          startIcon={<Delete />}
          onClick={() => void remove()}
          loading={deleteMutation.isPending}
          disabled={!!busy}
        >
          Elimina
        </Button>
      ) : null}
    </Stack>
  );
};

const DdtDetails: React.FC<{ ddt: Ddt }> = ({ ddt }) => {
  const { permission } = useModulePermission(AriesModule.Ddts);
  const { data: caresData } = useDeliveryCares();
  const { data: methodsData } = useDeliveryMethods();
  const { data: carriersData } = useCarriers();
  const isSupplier = !!ddt.supplierId;
  const destination = isSupplier ? ddt.supplierDestination : ddt.destination;
  const care = caresData?.deliveryCares.find((item) => item.id === ddt.deliveryCareId)?.name;
  const method = methodsData?.deliveryMethods.find((item) => item.id === ddt.deliveryMethodId)?.name;
  const carrier = carriersData?.carriers.find((item) => item.id === ddt.carrierId)?.name;
  const aspects = DDT_ASPECTS.filter((aspect) => (ddt.aspects & aspect.bit) !== 0).map((aspect) => aspect.label);
  const job = ddt.jobLink;
  const reports = ddt.reportLinks ?? [];
  const pickLists = ddt.pickLists ?? [];

  return (
    <>
      <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
        <DelphiColorChip label={ddt.status?.name ?? String(ddt.statusId)} delphiColor={ddt.status?.color} />
        {ddt.isPrinted ? <Chip size="small" color="success" variant="outlined" label="Stampato" /> : null}
        {ddt.invoiceId ? (
          <Chip size="small" variant="outlined" label={`Fattura ${ddt.invoiceId}/${ddt.invoiceYear}`} />
        ) : null}
        {ddt.hasRecipientSignature || ddt.hasDriverSignature ? (
          <Chip size="small" variant="outlined" label="Firmato" />
        ) : null}
      </Stack>

      <DetailGrid>
        <DetailRow
          label={isSupplier ? 'Fornitore' : 'Cliente'}
          value={isSupplier ? ddt.supplierName : ddt.customerName}
        />
        <DetailRow label="Data" value={getStringDateByUnixtimestamp(ddt.documentDate)} />
        <DetailRow label="Destinazione" value={formatDestination(destination)} />
        <DetailRow label="Impianto" value={ddt.systemDescription} />
        <DetailRow label="Causale" value={ddt.causal?.name ?? ddt.causalId} />
        <DetailRow
          label="Commessa"
          value={
            job
              ? [
                  `${job.jobId}/${job.jobYear} ${job.jobDescription?.trim() ?? ''}`.trim(),
                  job.subJobName,
                  job.lotDescription,
                ]
                  .filter(Boolean)
                  .join(' › ')
              : ''
          }
        />
      </DetailGrid>

      <Divider />

      <Typography variant="subtitle2">Trasporto</Typography>
      <DetailGrid>
        <DetailRow label="Trasporto a cura" value={care} />
        <DetailRow label="Porto" value={method} />
        {carrier ? <DetailRow label="Vettore" value={carrier} /> : null}
        <DetailRow label="Inizio trasporto" value={getStringDateTimeByUnixtimestamp(ddt.transportStart)} />
        <DetailRow label="Colli" value={ddt.packages ? String(ddt.packages) : ''} />
        <DetailRow label="Peso" value={ddt.weight ? `${ddt.weight} kg` : ''} />
        <DetailRow label="Aspetto dei beni" value={aspects.join(', ')} />
      </DetailGrid>

      <Divider />

      <Typography variant="subtitle2">Righe</Typography>
      <RowsTable rows={ddt.rows ?? []} showPrices={!!permission?.canPrices} />

      {reports.length || pickLists.length ? (
        <>
          <Divider />
          <Typography variant="subtitle2">Documenti collegati</Typography>
          <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
            {reports.map((report) => (
              <Chip
                key={`r-${report.reportYear}-${report.reportId}`}
                size="small"
                variant="outlined"
                label={`Rapporto ${report.reportNumber || report.reportId}/${report.reportYear}`}
              />
            ))}
            {pickLists.map((list) => (
              <Chip
                key={`l-${list.year}-${list.listId}`}
                size="small"
                variant="outlined"
                label={`Lista di prelievo ${list.listId}/${list.year}`}
              />
            ))}
          </Stack>
        </>
      ) : null}

      <Divider />

      <DetailRow label="Note interne" value={toText(ddt.description)} />
      <DetailRow label="Note piè DDT" value={toText(ddt.footerNote)} />
    </>
  );
};

const DdtAsideContent: React.FC<{ year: number; id: number }> = ({ year, id }) => {
  const ddtQuery = useDdtById(year, id);
  const ddt = ddtQuery.data;

  return (
    <>
      <AsideSummaryView
        title={`DDT ${id}/${year}`}
        subtitle={ddt ? ((ddt.supplierId ? ddt.supplierName : ddt.customerName) ?? '') : 'Caricamento...'}
      />
      <AsideContentView sx={{ gap: 2.5, overflowY: 'auto' }}>
        {ddtQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <CircularProgress />
          </Stack>
        ) : null}
        {ddtQuery.isError ? <Alert severity="error">Non sono riuscito a caricare il DDT.</Alert> : null}
        {ddtQuery.isSuccess && !ddt ? <Alert severity="warning">DDT non trovato.</Alert> : null}
        {ddt ? (
          <>
            <DdtActions ddt={ddt} />
            <Divider />
            <DdtDetails ddt={ddt} />
          </>
        ) : null}
      </AsideContentView>
    </>
  );
};

/** Read-only summary of the selected DDT, with the actions of the Delphi list (edit, PDF, email, delete). */
const DdtAside = () => {
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();
  const reset = useResetSelection();
  const selection = parseDdtSelectionId(activeId);

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={620}>
      {selection ? <DdtAsideContent key={activeId} year={selection.year} id={selection.id} /> : null}
    </SplitAside>
  );
};

export default DdtAside;
