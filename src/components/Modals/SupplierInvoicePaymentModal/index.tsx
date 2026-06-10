import { Dialog, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import InvoicePaymentForm, { InvoicePaymentFormRequest } from '../InvoicePaymentForm';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useEmployees } from '~/proxies/aries-proxy/employees';
import { usePaymentTypes } from '~/proxies/aries-proxy/payment-types';
import {
  useSaveSupplierInvoicePayment,
  useSupplierInvoicePayment,
} from '~/proxies/aries-proxy/supplier-invoice-payments';

interface SupplierInvoicePaymentModalProps extends ModalProps {
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
  id: number;
  paymentId: number;
  title?: string;
  counterpartName?: string;
  year: number;
}

const SupplierInvoicePaymentModal = (props: SupplierInvoicePaymentModalProps) => {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const isMobileDialog = useMediaQuery(theme.breakpoints.down('sm'));
  const paymentQuery = useSupplierInvoicePayment(props.year, props.id, props.paymentId);
  const paymentTypesQuery = usePaymentTypes();
  const employeesQuery = useEmployees();
  const saveMutation = useSaveSupplierInvoicePayment();

  const close = () => {
    if (saveMutation.isPending) return;

    props.closeModal({ action: 'CLOSE' });
  };

  const save = async (request: InvoicePaymentFormRequest) => {
    try {
      await saveMutation.mutateAsync({
        id: props.id,
        paymentId: props.paymentId,
        request,
        year: props.year,
      });

      snackbar.success('Pagamento salvato');
      props.closeModal({ action: 'SAVED' });
    } catch {
      snackbar.error('Non e stato possibile salvare il pagamento');
    }
  };

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth fullScreen={isMobileDialog}>
      <DialogTitle>Pagamento fattura fornitore</DialogTitle>
      <InvoicePaymentForm
        counterpartName={props.counterpartName}
        employees={employeesQuery.data ?? []}
        heading={props.title ?? `Fattura fornitore ${props.id}/${props.year}`}
        isEmployeesError={employeesQuery.isError}
        isEmployeesLoading={employeesQuery.isLoading}
        isMobileDialog={isMobileDialog}
        isPaymentError={paymentQuery.isError}
        isPaymentLoading={paymentQuery.isLoading}
        isPaymentTypesError={paymentTypesQuery.isError}
        isPaymentTypesLoading={paymentTypesQuery.isLoading}
        isSaving={saveMutation.isPending}
        onCancel={close}
        onSave={save}
        payment={paymentQuery.data}
        paymentTypes={paymentTypesQuery.data?.paymentTypes ?? []}
      />
    </Dialog>
  );
};

export default SupplierInvoicePaymentModal;
