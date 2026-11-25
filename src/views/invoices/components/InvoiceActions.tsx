import { MouseEvent, useState } from 'react';
import { Code, ContentCopy, Delete, Edit, MoreVert, PictureAsPdf, Receipt } from '@mui/icons-material';
import { Button, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { createEInvoice, printInvoice } from '~/proxies/aries-proxy/api/invoices';
import {
  useCloneInvoice,
  useDeleteInvoice,
  useInvoiceEditorDefaults,
  usePromoteInvoice,
  useSetInvoiceFlags,
} from '~/proxies/aries-proxy/invoices';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { INVOICE_SENT_TYPES, Invoice } from '~/types/aries-proxy/invoices';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { formatInvoiceNumber } from '../list/state';
import InvoicePromoteModal from './InvoicePromoteModal';

interface Props {
  invoice: Invoice;
  /** The aside shows "Modifica"; the editor doesn't. */
  showEdit?: boolean;
  /** After delete (the aside closes, the editor goes back to the list). */
  onDeleted: () => void;
}

const invoiceLink = (invoice: { year: number; id: number }) =>
  RouteConfig.InvoiceDetail.buildLink({ year: String(invoice.year), invoiceId: String(invoice.id) });

/** Actions of the Delphi list menu: duplicate, preinvoice to invoice, printed, sent with, delete. */
const InvoiceActions: React.FC<Props> = ({ invoice, showEdit, onDeleted }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const { permission } = useModulePermission(AriesModule.Invoices);
  const defaultsQuery = useInvoiceEditorDefaults({ enabled: invoice.isPreinvoice });
  const cloneMutation = useCloneInvoice();
  const promoteMutation = usePromoteInvoice();
  const flagsMutation = useSetInvoiceFlags();
  const deleteMutation = useDeleteInvoice();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const label = formatInvoiceNumber(invoice);
  const busy =
    cloneMutation.isPending || promoteMutation.isPending || flagsMutation.isPending || deleteMutation.isPending;

  const [working, setWorking] = useState<'pdf' | 'xml' | null>(null);

  const closeMenu = () => setMenuAnchor(null);

  const print = async () => {
    setWorking('pdf');
    try {
      const pdf = (await printInvoice(invoice.year, invoice.id)).data;
      await modal.showModal({
        component: PdfPreviewModal,
        props: { pdf: new Blob([pdf], { type: 'application/pdf' }), title: label },
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare il PDF.'));
    } finally {
      setWorking(null);
    }
  };

  /** Delphi PrintEInvoice: asks whether to attach the DDTs, then the XML is downloaded (and saved in the invoice folder). */
  const eInvoice = async () => {
    let attachDdts = false;
    if (invoice.documents?.some((document) => document.type === 'ddt')) {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: { title: 'Fattura elettronica', text: 'Allegare i DDT alla fattura elettronica?' },
      });
      attachDdts = answer.action === 'YES';
    }
    setWorking('xml');
    try {
      const result = (await createEInvoice(invoice.year, invoice.id, attachDdts)).data;
      const url = URL.createObjectURL(new Blob([result.xml], { type: 'application/xml' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      result.warnings.forEach((warning) => snackbar.warning(warning));
      snackbar.success(
        result.savedPath ? `Fattura elettronica creata e salvata in ${result.savedPath}` : 'Fattura elettronica creata',
      );
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare la fattura elettronica.'));
    } finally {
      setWorking(null);
    }
  };

  const clone = async () => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Duplica', text: `Duplicare ${label}? La copia è una nuova prefattura.` },
    });
    if (answer.action !== 'YES') return;
    try {
      const copy = await cloneMutation.mutateAsync({ year: invoice.year, id: invoice.id });
      snackbar.success('Fattura duplicata');
      if (copy) navigate(invoiceLink(copy));
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Errore imprevisto durante la duplicazione.'));
    }
  };

  const promote = async () => {
    const answer = await modal.showModal({
      component: InvoicePromoteModal,
      props: {
        preinvoiceId: invoice.id,
        preinvoiceDate: invoice.invoiceDate,
        lastInvoiceDate: defaultsQuery.data?.lastInvoiceDate,
      },
    });
    if (answer.action !== 'YES') return;
    try {
      const promoted = await promoteMutation.mutateAsync({ id: invoice.id, invoiceDate: answer.invoiceDate });
      snackbar.success(
        promoted ? `Prefattura trasformata nella fattura ${promoted.id}/${promoted.year}` : 'Fattura creata',
      );
      if (promoted) navigate(invoiceLink(promoted), { replace: !showEdit });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Errore durante la trasformazione da prefattura a fattura.'));
    }
  };

  const setFlags = async (data: { isPrinted?: boolean; sentType?: number }) => {
    closeMenu();
    try {
      await flagsMutation.mutateAsync({ year: invoice.year, id: invoice.id, data });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile aggiornare la fattura.'));
    }
  };

  // Delphi asks twice for an invoice, once for a preinvoice.
  const remove = async () => {
    closeMenu();
    const first = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina',
        text: `Sei sicuro di voler eliminare ${invoice.isPreinvoice ? 'la prefattura' : 'la fattura'} ${label}?`,
        alertText: invoice.documents?.length
          ? 'Rapporti, resoconti e DDT collegati tornano da fatturare; il collegamento alla commessa viene rimosso.'
          : undefined,
        alertSeverity: 'warning',
      },
    });
    if (first.action !== 'YES') return;
    if (!invoice.isPreinvoice) {
      const second = await modal.showModal({
        component: ConfirmationModal,
        props: { title: 'Elimina fattura', text: 'Sei davvero sicuro di voler eliminare la fattura?' },
      });
      if (second.action !== 'YES') return;
    }
    try {
      await deleteMutation.mutateAsync({ year: invoice.year, id: invoice.id });
      snackbar.success(invoice.isPreinvoice ? 'Prefattura eliminata' : 'Fattura eliminata');
      onDeleted();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare la fattura.'));
    }
  };

  return (
    <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
      {showEdit ? (
        <Button component={RouterLink} to={invoiceLink(invoice)} variant="contained" startIcon={<Edit />}>
          {permission?.canEdit ? 'Modifica' : 'Apri'}
        </Button>
      ) : null}
      {permission?.canPrint ? (
        <Button
          variant="outlined"
          startIcon={working === 'pdf' ? <CircularProgress size={16} /> : <PictureAsPdf />}
          onClick={() => void print()}
          disabled={!!working}
        >
          PDF
        </Button>
      ) : null}
      {permission?.canPrint && !invoice.isPreinvoice ? (
        <Button
          variant="outlined"
          startIcon={working === 'xml' ? <CircularProgress size={16} /> : <Code />}
          onClick={() => void eInvoice()}
          disabled={!!working}
        >
          Fattura elettronica
        </Button>
      ) : null}
      {invoice.isPreinvoice && permission?.canEdit ? (
        <Button variant="outlined" startIcon={<Receipt />} onClick={() => void promote()} disabled={busy}>
          Trasforma in fattura
        </Button>
      ) : null}
      {permission?.canInsert ? (
        <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => void clone()} disabled={busy}>
          Duplica
        </Button>
      ) : null}
      {permission?.canEdit || permission?.canDelete ? (
        <>
          <Button
            variant="text"
            startIcon={<MoreVert />}
            onClick={(event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget)}
            disabled={busy}
          >
            Altro
          </Button>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
            {permission.canEdit ? (
              <MenuItem onClick={() => void setFlags({ isPrinted: !invoice.isPrinted })}>
                <ListItemText>{invoice.isPrinted ? 'Segna come non stampata' : 'Segna come stampata'}</ListItemText>
              </MenuItem>
            ) : null}
            {permission.canEdit
              ? INVOICE_SENT_TYPES.map((type) => (
                  <MenuItem
                    key={type.id}
                    selected={invoice.sentType === type.id}
                    onClick={() => void setFlags({ sentType: type.id })}
                  >
                    <ListItemText inset>
                      {type.id === 0 ? 'Segna come non inviata' : `Inviata: ${type.label}`}
                    </ListItemText>
                  </MenuItem>
                ))
              : null}
            {permission.canEdit && permission.canDelete ? <Divider /> : null}
            {permission.canDelete ? (
              <MenuItem onClick={() => void remove()} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Elimina</ListItemText>
              </MenuItem>
            ) : null}
          </Menu>
        </>
      ) : null}
    </Stack>
  );
};

export default InvoiceActions;
