import { useEffect, useMemo } from 'react';
import { Alert, Chip, CircularProgress, Stack } from '@mui/material';
import { format } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import DetailPageHeader from '~/components/Layout/DetailPageHeader';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getInvoiceCustomerDefaults } from '~/proxies/aries-proxy/api/invoices';
import {
  useCreateInvoice,
  useInvoiceById,
  useInvoiceEditorDefaults,
  useInvoiceLookups,
  useSaveInvoice,
} from '~/proxies/aries-proxy/invoices';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { INVOICE_SENT_TYPES } from '~/types/aries-proxy/invoices';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import InvoiceActions from '../components/InvoiceActions';
import { formatInvoiceNumber } from '../list/state';
import InvoiceBankCard from './components/InvoiceBankCard';
import InvoiceHeaderCard from './components/InvoiceHeaderCard';
import InvoiceNotesCard from './components/InvoiceNotesCard';
import InvoiceRowsCard from './components/InvoiceRowsCard';
import InvoiceTotalsCard from './components/InvoiceTotalsCard';
import {
  computeTotals,
  fromInvoice,
  getZeroPriceRows,
  InvoiceFormValues,
  newInvoiceValues,
  noteRow,
  toSaveRequest,
} from './invoiceFormValues';

const invoiceLink = (invoice: { year: number; id: number }) =>
  RouteConfig.InvoiceDetail.buildLink({ year: String(invoice.year), invoiceId: String(invoice.id) });

/**
 * Create and edit an invoice or a preinvoice, like the Delphi TFInvoiceEditor: header, bank, rows, extra costs, totals
 * by VAT, notes and purchase order. A new number, or a date in another year, renumbers the invoice.
 * Importing reports / DDTs / report groups / jobs is not here yet: those rows are kept as they are.
 */
const InvoiceEditorView = () => {
  const params = useParams<{ year: string; invoiceId: string }>();
  const year = params.year !== undefined ? Number(params.year) : undefined;
  const id = params.invoiceId ? Number(params.invoiceId) : undefined;
  const isNew = !id;
  const navigate = useNavigate();
  const modal = useModal();
  const snackbar = useSnackbar();
  const { permission } = useModulePermission(AriesModule.Invoices);
  const invoiceQuery = useInvoiceById(year, id);
  const lookupsQuery = useInvoiceLookups();
  const defaultsQuery = useInvoiceEditorDefaults();
  const createMutation = useCreateInvoice();
  const saveMutation = useSaveInvoice();
  const invoice = invoiceQuery.data;
  const lookups = lookupsQuery.data;
  const defaults = defaultsQuery.data;

  const form = useForm<InvoiceFormValues>();
  const initialValues = useMemo(() => {
    if (!lookups || !defaults) return null;
    if (isNew) return newInvoiceValues(defaults);
    return invoice ? fromInvoice(invoice) : null;
  }, [isNew, invoice, lookups, defaults]);

  useEffect(() => {
    if (initialValues) form.reset(initialValues);
  }, [initialValues, form]);

  const ready = !!initialValues;
  const saving = createMutation.isPending || saveMutation.isPending;
  const canSave = isNew ? !!permission?.canInsert : !!permission?.canEdit;
  const lastInvoiceDate = defaults?.lastInvoiceDate
    ? format(getDateByUnixtimestamp({ unixTimestamp: defaults.lastInvoiceDate }), 'yyyy-MM-dd')
    : undefined;

  const confirm = async (title: string, text: string, alertText?: string) =>
    (
      await modal.showModal({
        component: ConfirmationModal,
        props: { title, text, alertText, alertSeverity: 'warning' },
      })
    ).action === 'YES';

  /** Notes Delphi offers when an invoice is inserted: VAT nature / VAT type note and intent letter. */
  const offerNotes = async (values: InvoiceFormValues) => {
    const rows = [...values.rows];
    const vat = lookups?.vatTypes.find((item) => item.id === values.vatId);
    const nature = lookups?.vatNatureTypes.find((item) => item.id === values.vatNatureTypeId);
    if (nature?.invoiceNote?.trim()) {
      if (await confirm('Nota IVA', `Aggiungere la nota della natura IVA ${nature.name}?`))
        rows.push(noteRow(nature.invoiceNote));
    } else if (vat?.description?.trim()) {
      if (await confirm('Nota IVA', `Aggiungere la nota dell'IVA ${vat.name ?? ''}?`))
        rows.push(noteRow(vat.description));
    }
    if (values.customer) {
      try {
        const customerDefaults = (await getInvoiceCustomerDefaults(values.customer.id, values.invoiceDate)).data;
        if (
          customerDefaults.intentLetterNote?.trim() &&
          (await confirm("Lettera d'intento", "Aggiungere la nota per il regime IVA fissato con lettera d'intento?"))
        )
          rows.push(noteRow(customerDefaults.intentLetterNote));
      } catch {
        // Only a suggestion.
      }
    }
    return rows;
  };

  const submit = form.handleSubmit(async (values) => {
    if (!values.customer) return snackbar.error('Indicare un cliente prima di procedere.');
    if (values.destinationId === '') return snackbar.error('Indicare una destinazione valida.');
    if (values.vatId === '') return snackbar.error('Indicare il tipo IVA della fattura.');
    const vat = lookups?.vatTypes.find((item) => item.id === values.vatId);
    if (vat && Math.round(vat.rate) === 0 && values.vatNatureTypeId === '')
      return snackbar.error('Attenzione, nessuna natura IVA selezionata.');
    const emptyRows = values.rows.map((row, index) => (row.text.trim() ? null : index + 1)).filter(Boolean);
    if (emptyRows.length)
      return snackbar.error(`Attenzione, le righe ${emptyRows.join(' - ')} hanno descrizione vuota.`);
    if (values.hasPurchaseOrder && (!values.purchaseOrderDocumentId.trim() || !values.purchaseOrderDate))
      return snackbar.error("Indicare id documento e data dell'ordine di acquisto.");

    // Same questions as Delphi, in the same order.
    const zeroPrice = getZeroPriceRows(values.rows);
    if (
      zeroPrice.length &&
      !(await confirm('Prezzi a zero', `Prezzo a 0 nelle righe: ${zeroPrice.join('; ')}. Continuare comunque?`))
    )
      return;
    if (
      computeTotals(values, lookups?.vatTypes ?? []).vat10ProductsAlert &&
      !(await confirm(
        'IVA 10%',
        'Il prezzo del materiale dovrebbe essere inferiore al prezzo della manodopera. Vuoi proseguire?',
      ))
    )
      return;
    if (
      !isNew &&
      invoice?.sentType &&
      !(await confirm('Fattura inviata', 'La fattura risulta già inviata. Sei davvero sicuro di volerla modificare?'))
    )
      return;

    let toSave = values;
    if (isNew) {
      if (
        !values.isPreinvoice &&
        lastInvoiceDate &&
        values.invoiceDate < lastInvoiceDate &&
        values.invoiceDate.slice(0, 4) === lastInvoiceDate.slice(0, 4) &&
        (await confirm(
          'Data fattura',
          `La data precede l'ultima fattura. Usare la data dell'ultima fattura (${lastInvoiceDate.split('-').reverse().join('/')})?`,
        ))
      )
        toSave = { ...toSave, invoiceDate: lastInvoiceDate };
      toSave = { ...toSave, rows: await offerNotes(toSave) };
    }

    const request = toSaveRequest(toSave);
    const newYear = invoice?.isPreinvoice ? 0 : Number(toSave.invoiceDate.slice(0, 4));
    const newId = request.invoiceId ?? id;
    const renumbered = !isNew && (newId !== id || newYear !== year);
    if (
      renumbered &&
      !(await confirm('Rinumera fattura', `La fattura ${id}/${year} diventa ${newId}/${newYear}. Continuare?`))
    )
      return;

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(request);
        snackbar.success(toSave.isPreinvoice ? 'Prefattura inserita' : 'Fattura inserita');
        if (created) navigate(invoiceLink(created), { replace: true });
      } else {
        const saved = await saveMutation.mutateAsync({ year: year as number, id, data: request });
        snackbar.success(renumbered && saved ? `Fattura salvata come ${saved.id}/${saved.year}` : 'Fattura salvata');
        if (saved && (saved.id !== id || saved.year !== year)) navigate(invoiceLink(saved), { replace: true });
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare la fattura.'));
    }
  });

  if (!isNew && invoiceQuery.isSuccess && !invoice) {
    return (
      <PageContainer>
        <Alert severity="warning">Fattura non trovata.</Alert>
      </PageContainer>
    );
  }

  const title = isNew ? 'Nuova fattura' : invoice ? formatInvoiceNumber(invoice) : '';
  const sentLabel = INVOICE_SENT_TYPES.find((type) => type.id === invoice?.sentType)?.label;

  return (
    <PageContainer>
      <FormProvider {...form}>
        <Stack component="form" spacing={2.5} onSubmit={submit} sx={{ pb: 10 }}>
          <DetailPageHeader
            backTo={RouteConfig.InvoiceList.buildLink()}
            title={isNew ? title : `${invoice?.isPreinvoice ? '' : 'Fattura '}${title}`}
            badges={
              invoice ? (
                <>
                  <DelphiColorChip
                    label={invoice.status?.name ?? String(invoice.statusId)}
                    delphiColor={invoice.status?.color}
                  />
                  {invoice.sentType ? (
                    <Chip size="small" color="success" variant="outlined" label={`Inviata: ${sentLabel}`} />
                  ) : null}
                </>
              ) : null
            }
            actions={
              invoice ? (
                <InvoiceActions
                  invoice={invoice}
                  onDeleted={() => navigate(RouteConfig.InvoiceList.buildLink(), { replace: true })}
                />
              ) : null
            }
          />

          {!ready ? (
            <Stack sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <>
              {invoice?.sentType ? (
                <Alert severity="warning">
                  La fattura è già stata inviata: modificala solo se sai cosa stai facendo.
                </Alert>
              ) : null}
              <InvoiceHeaderCard isNew={isNew} year={year} lastInvoiceDate={lastInvoiceDate} />
              <InvoiceRowsCard showCosts={!!permission?.canPrices} />
              <InvoiceTotalsCard showCosts={!!permission?.canTotals} />
              <InvoiceBankCard />
              <InvoiceNotesCard />
            </>
          )}

          {ready && canSave && (isNew || form.formState.isDirty) ? (
            <FormSaveBar
              saving={saving}
              cancelLabel={isNew ? 'Annulla' : 'Annulla modifiche'}
              submitLabel={isNew ? 'Inserisci' : 'Salva fattura'}
              onCancel={() => (isNew ? navigate(RouteConfig.InvoiceList.buildLink()) : form.reset(initialValues))}
            />
          ) : null}
        </Stack>
      </FormProvider>
    </PageContainer>
  );
};

export default InvoiceEditorView;
