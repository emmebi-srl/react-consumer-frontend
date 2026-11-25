import {
  Alert,
  Box,
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
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import SplitAside from '~/components/Layout/SplitAside';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { useInvoiceById, useInvoiceLookups } from '~/proxies/aries-proxy/invoices';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { INVOICE_SENT_TYPES, INVOICE_TEXT_ROW_TYPES, Invoice, InvoiceRow } from '~/types/aries-proxy/invoices';
import { AriesModule } from '~/types/aries-proxy/users';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import InvoiceActions from '../../components/InvoiceActions';
import { formatDestination, invoiceDocumentLabel, rowTaxableAmount, toText } from '../../invoiceHelpers';
import { parseInvoiceSelectionId, useActiveId, useIsSidebarOpen, useResetSelection } from '../state';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

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

const RowsTable: React.FC<{ rows: InvoiceRow[] }> = ({ rows }) => {
  if (!rows.length)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nessuna riga
      </Typography>
    );
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Descrizione</TableCell>
          <TableCell align="right">Q.tà</TableCell>
          <TableCell align="right">Importo</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => {
          const isText = INVOICE_TEXT_ROW_TYPES.includes(row.rowType);
          return (
            <TableRow key={row.position ?? index}>
              <TableCell sx={{ maxWidth: 0, width: '100%' }}>
                {row.productCode ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.productCode}
                    {row.serialNumber ? ` · S/N ${row.serialNumber}` : ''}
                  </Typography>
                ) : null}
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    fontStyle: isText ? 'italic' : undefined,
                    color: isText ? 'text.secondary' : undefined,
                  }}
                >
                  {toText(row.description) || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {isText || row.quantity == null ? '' : `${row.quantity} ${row.measureUnit ?? ''}`}
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {isText ? '' : toEuro(rowTaxableAmount(row))}
                {!isText && row.discount ? (
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    sconto {row.discount}%
                  </Typography>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const TotalsTable: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>IVA</TableCell>
        <TableCell align="right">Imponibile</TableCell>
        <TableCell align="right">Imposta</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {(invoice.amountsByTax ?? []).map((amount) => (
        <TableRow key={amount.vatId}>
          <TableCell>{amount.vat?.name ?? `${amount.vat?.rate ?? ''}%`}</TableCell>
          <TableCell align="right">{toEuro(amount.taxableAmount)}</TableCell>
          <TableCell align="right">{toEuro(amount.taxAmount)}</TableCell>
        </TableRow>
      ))}
      <TableRow>
        <TableCell>
          <Typography variant="subtitle2">Totale documento</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="subtitle2">{toEuro(invoice.taxableAmount)}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="subtitle2">{toEuro(invoice.totalAmount)}</Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const InvoiceDetails: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const { permission } = useModulePermission(AriesModule.Invoices);
  const { data: lookups } = useInvoiceLookups();
  const interventionType = lookups?.interventionTypes.find((type) => type.id === invoice.study?.interventionTypeId);
  const systemType = lookups?.systemTypes.find((type) => type.id === invoice.study?.systemTypeId);
  const sentLabel = INVOICE_SENT_TYPES.find((type) => type.id === invoice.sentType)?.label;
  const extras = [
    invoice.collectionCost ? `Incasso ${toEuro(invoice.collectionCost)}` : '',
    invoice.stampDuty ? `Bollo ${toEuro(invoice.stampDuty)}` : '',
    invoice.transportCost ? `Trasporto ${toEuro(invoice.transportCost)}` : '',
  ].filter(Boolean);

  return (
    <>
      <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
        <DelphiColorChip label={invoice.status?.name ?? String(invoice.statusId)} delphiColor={invoice.status?.color} />
        {invoice.sentType ? (
          <Chip size="small" color="success" variant="outlined" label={`Inviata: ${sentLabel}`} />
        ) : null}
        {invoice.isPrinted ? <Chip size="small" variant="outlined" label="Stampata" /> : null}
        {invoice.isCustomerInsolvent ? (
          <Chip size="small" color="error" variant="outlined" label="Cliente insolvente" />
        ) : null}
      </Stack>

      <DetailGrid>
        <DetailRow label="Cliente" value={invoice.customerName} />
        <DetailRow label="Data" value={getStringDateByUnixtimestamp(invoice.invoiceDate)} />
        <DetailRow label="Destinazione" value={formatDestination(invoice.destination)} />
        <DetailRow
          label="P.IVA / C.F."
          value={[invoice.customerVatNumber, invoice.customerTaxCode].filter(Boolean).join(' / ')}
        />
        <DetailRow label="Tipo" value={invoice.type?.name} />
        <DetailRow label="Causale" value={invoice.causal?.name} />
        <DetailRow label="Pagamento" value={invoice.paymentCondition?.name} />
        <DetailRow
          label="IVA"
          value={[invoice.vat?.name, invoice.vatNatureType ? `natura ${invoice.vatNatureType.eInvoiceCode}` : '']
            .filter(Boolean)
            .join(' · ')}
        />
        <DetailRow label="Banca" value={[invoice.bankName, invoice.iban].filter(Boolean).join(' · ')} />
        <DetailRow
          label="Studi di settore"
          value={[interventionType?.name, systemType?.name].filter(Boolean).join(' · ')}
        />
      </DetailGrid>

      <Divider />

      <Typography variant="subtitle2">Righe</Typography>
      <RowsTable rows={invoice.rows ?? []} />
      {extras.length ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {extras.join(' · ')}
        </Typography>
      ) : null}

      <Divider />

      <Typography variant="subtitle2">Totali</Typography>
      <TotalsTable invoice={invoice} />
      {permission?.canTotals ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Costo {toEuro(invoice.totalCost)} · Margine {toEuro(invoice.taxableAmount - invoice.totalCost)}
        </Typography>
      ) : null}

      {invoice.documents?.length ? (
        <>
          <Divider />
          <Typography variant="subtitle2">Documenti fatturati</Typography>
          <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
            {invoice.documents.map((document) => (
              <Chip
                key={`${document.type}-${document.year}-${document.id}`}
                size="small"
                variant="outlined"
                label={invoiceDocumentLabel(document)}
              />
            ))}
          </Stack>
        </>
      ) : null}

      {invoice.purchaseOrder ? (
        <>
          <Divider />
          <DetailGrid>
            <DetailRow
              label="Ordine di acquisto"
              value={`${invoice.purchaseOrder.documentId} del ${getStringDateByUnixtimestamp(Number(invoice.purchaseOrder.date))}`}
            />
            <DetailRow
              label="CIG / CUP"
              value={[invoice.purchaseOrder.cigCode, invoice.purchaseOrder.cupCode].filter(Boolean).join(' / ')}
            />
          </DetailGrid>
        </>
      ) : null}

      <Divider />

      <DetailRow label="Annotazioni (in stampa)" value={toText(invoice.annotations)} />
      <DetailRow label="Descrizione interna" value={invoice.internalNote} />
    </>
  );
};

const InvoiceAsideContent: React.FC<{ year: number; id: number }> = ({ year, id }) => {
  const invoiceQuery = useInvoiceById(year, id);
  const resetSelection = useResetSelection();
  const invoice = invoiceQuery.data;
  const title = year === 0 ? `Prefattura ${id}` : `Fattura ${id}/${year}`;

  return (
    <>
      <AsideSummaryView title={title} subtitle={invoice ? (invoice.customerName ?? '') : 'Caricamento...'} />
      <AsideContentView sx={{ gap: 2.5, overflowY: 'auto' }}>
        {invoiceQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <CircularProgress />
          </Stack>
        ) : null}
        {invoiceQuery.isError ? <Alert severity="error">Non sono riuscito a caricare la fattura.</Alert> : null}
        {invoiceQuery.isSuccess && !invoice ? <Alert severity="warning">Fattura non trovata.</Alert> : null}
        {invoice ? (
          <>
            <InvoiceActions invoice={invoice} showEdit onDeleted={resetSelection} />
            <Divider />
            <InvoiceDetails invoice={invoice} />
          </>
        ) : null}
      </AsideContentView>
    </>
  );
};

/** Read-only summary of the selected invoice, with the actions of the Delphi list. */
const InvoiceAside = () => {
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();
  const reset = useResetSelection();
  const selection = parseInvoiceSelectionId(activeId);

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={620}>
      {selection ? <InvoiceAsideContent key={activeId} year={selection.year} id={selection.id} /> : null}
    </SplitAside>
  );
};

export default InvoiceAside;
