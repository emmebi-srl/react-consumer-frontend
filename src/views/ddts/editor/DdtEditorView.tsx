import { useEffect, useMemo, useState } from 'react';
import { Delete, PictureAsPdf } from '@mui/icons-material';
import { Alert, Button, Chip, CircularProgress, Stack } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import DetailPageHeader from '~/components/Layout/DetailPageHeader';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getDdtPdf } from '~/proxies/aries-proxy/api/ddts';
import {
  useCreateDdt,
  useDdtAspects,
  useDdtById,
  useDeleteDdt,
  useDeliveryCares,
  useDeliveryMethods,
  useSaveDdt,
  useTransportCausals,
} from '~/proxies/aries-proxy/ddts';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import DdtRecipientCard from './components/DdtRecipientCard';
import DdtDocumentsCard from './components/DdtDocumentsCard';
import DdtJobCard from './components/DdtJobCard';
import DdtRowsCard from './components/DdtRowsCard';
import DdtSignaturesCard from './components/DdtSignaturesCard';
import DdtTransportCard from './components/DdtTransportCard';
import { DdtFormValues, fromDdt, newDdtValues, toSaveRequest } from './ddtFormValues';

/** Causal of a new DDT in Delphi (TFDDTEditor.FormCreate). */
const DEFAULT_CAUSAL_ID = 'VI';

/**
 * Create and edit a DDT, like the Delphi TFDDTEditor: header, job, rows (kits, economy), transport, imported
 * reports and pick lists, signatures, PDF. A new number or a date in another year renumbers the DDT.
 */
const DdtEditorView = () => {
  const params = useParams<{ year: string; ddtId: string }>();
  const year = params.year ? Number(params.year) : undefined;
  const id = params.ddtId ? Number(params.ddtId) : undefined;
  const isNew = !id;
  const navigate = useNavigate();
  const modal = useModal();
  const snackbar = useSnackbar();
  const { permission } = useModulePermission(AriesModule.Ddts);
  const ddtQuery = useDdtById(year, id);
  const causalsQuery = useTransportCausals();
  const aspectsQuery = useDdtAspects();
  const caresQuery = useDeliveryCares();
  const methodsQuery = useDeliveryMethods();
  const createMutation = useCreateDdt();
  const saveMutation = useSaveDdt();
  const deleteMutation = useDeleteDdt();
  const [printing, setPrinting] = useState(false);

  const form = useForm<DdtFormValues>({
    defaultValues: newDdtValues({
      causalId: '',
      defaultDepotId: '',
      deliveryCareId: '',
      deliveryMethodId: '',
      aspects: 0,
      printTransportTime: false,
    }),
  });
  const ddt = ddtQuery.data;
  const causalsData = causalsQuery.data;
  const aspectsData = aspectsQuery.data;
  const caresData = caresQuery.data;
  const methodsData = methodsQuery.data;
  const lookupsReady = !!causalsData && !!aspectsData && !!caresData && !!methodsData;
  const ready = lookupsReady && (isNew || !!ddt);

  const initialValues = useMemo(() => {
    if (!causalsData || !aspectsData || !caresData || !methodsData) return null;
    const causals = causalsData.causals;
    if (!isNew) {
      if (!ddt) return null;
      const causal = causals.find((item) => item.id.toUpperCase() === (ddt.causalId ?? '').toUpperCase());
      return fromDdt(ddt, causal?.defaultDepotId ?? '');
    }
    const causal = causals.find((item) => item.id === DEFAULT_CAUSAL_ID) ?? causals.at(0);
    return newDdtValues({
      causalId: causal?.id ?? '',
      defaultDepotId: causal?.defaultDepotId ?? '',
      deliveryCareId: caresData.deliveryCares.at(0)?.id ?? '',
      deliveryMethodId: methodsData.deliveryMethods.at(0)?.id ?? '',
      aspects: aspectsData.defaultMask,
      printTransportTime: aspectsData.defaultPrintTransportTime,
    });
  }, [isNew, ddt, causalsData, caresData, methodsData, aspectsData]);

  useEffect(() => {
    if (initialValues) form.reset(initialValues);
  }, [initialValues, form]);

  const saving = createMutation.isPending || saveMutation.isPending;
  const canSave = isNew ? !!permission?.canInsert : !!permission?.canEdit;

  const submit = form.handleSubmit(async (values) => {
    if (!values.recipient) {
      snackbar.error(values.isCustomer ? 'Indicare un cliente' : 'Indicare un fornitore');
      return;
    }
    // Same question as Delphi AddDDT/SaveDDT.
    if (values.isCustomer && values.systemId === '') {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Nessun impianto',
          text: 'Non è stato selezionato alcun impianto. Continuare con il salvataggio?',
        },
      });
      if (answer.action !== 'YES') return;
    }

    const request = toSaveRequest(values);
    // sp_ddtUpdate moves the DDT: rows, links and signatures follow it.
    const newYear = Number(values.documentDate.slice(0, 4));
    const newId = request.ddtNumber ?? id;
    const renumbered = !isNew && (newId !== id || (!!year && year >= 1000 && newYear !== year));
    if (renumbered) {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Rinumera DDT',
          text: `Il DDT ${id}/${year} diventa ${newId}/${year && year < 1000 ? year : newYear}. Continuare?`,
        },
      });
      if (answer.action !== 'YES') return;
    }

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(request);
        snackbar.success('DDT inserito');
        if (created)
          navigate(RouteConfig.DdtDetail.buildLink({ year: String(created.year), ddtId: String(created.id) }), {
            replace: true,
          });
      } else {
        const saved = await saveMutation.mutateAsync({ year: year as number, id, data: request });
        snackbar.success(renumbered && saved ? `DDT salvato come ${saved.id}/${saved.year}` : 'DDT salvato');
        if (saved && (saved.id !== id || saved.year !== year))
          navigate(RouteConfig.DdtDetail.buildLink({ year: String(saved.year), ddtId: String(saved.id) }), {
            replace: true,
          });
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il DDT.'));
    }
  });

  const remove = async () => {
    if (!ddt) return;
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
      navigate(RouteConfig.DdtList.buildLink(), { replace: true });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare il DDT.'));
    }
  };

  const print = async () => {
    if (!ddt) return;
    if (form.formState.isDirty) snackbar.info('Il PDF mostra il DDT salvato: salva prima le modifiche.');
    setPrinting(true);
    try {
      const pdf = (await getDdtPdf(ddt.year, ddt.id)).data;
      modal.showModal({
        component: PdfPreviewModal,
        props: { pdf: new Blob([pdf], { type: 'application/pdf' }), title: `DDT ${ddt.id}/${ddt.year}` },
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare il PDF.'));
    } finally {
      setPrinting(false);
    }
  };

  if (!isNew && ddtQuery.isSuccess && !ddt) {
    return (
      <PageContainer>
        <Alert severity="warning">DDT non trovato.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormProvider {...form}>
        <Stack component="form" spacing={2.5} onSubmit={submit} sx={{ pb: 10 }}>
          <DetailPageHeader
            backTo={RouteConfig.DdtList.buildLink()}
            title={isNew ? 'Nuovo DDT' : `DDT ${id}/${year}`}
            badges={
              ddt?.status || ddt?.invoiceId ? (
                <>
                  {ddt.status ? <Chip size="small" label={ddt.status.name} /> : null}
                  {ddt.invoiceId ? (
                    <Chip size="small" variant="outlined" label={`Fattura ${ddt.invoiceId}/${ddt.invoiceYear}`} />
                  ) : null}
                </>
              ) : null
            }
            actions={
              !isNew && ddt && (permission?.canPrint || permission?.canDelete) ? (
                <>
                  {permission.canPrint ? (
                    <Button
                      variant="outlined"
                      startIcon={printing ? <CircularProgress size={16} /> : <PictureAsPdf />}
                      onClick={() => void print()}
                      disabled={printing}
                    >
                      PDF
                    </Button>
                  ) : null}
                  {permission.canDelete ? (
                    <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => void remove()}>
                      Elimina
                    </Button>
                  ) : null}
                </>
              ) : null
            }
          />

          {!ready ? (
            <Stack sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <>
              <DdtRecipientCard isNew={isNew} year={year} />
              <DdtJobCard />
              <DdtRowsCard
                ddtId={ddt?.id}
                ddtYear={ddt?.year}
                showPrices={!!permission?.canPrices}
                showTotals={!!permission?.canTotals}
              />
              <DdtTransportCard />
              <DdtDocumentsCard isNew={isNew} />
              {!isNew && ddt ? <DdtSignaturesCard ddt={ddt} canEdit={!!permission?.canEdit} /> : null}
            </>
          )}

          {ready && canSave && (isNew || form.formState.isDirty) ? (
            <FormSaveBar
              saving={saving}
              cancelLabel={isNew ? 'Annulla' : 'Annulla modifiche'}
              submitLabel={isNew ? 'Inserisci DDT' : 'Salva DDT'}
              onCancel={() =>
                isNew ? navigate(RouteConfig.DdtList.buildLink()) : initialValues && form.reset(initialValues)
              }
            />
          ) : null}
        </Stack>
      </FormProvider>
    </PageContainer>
  );
};

export default DdtEditorView;
