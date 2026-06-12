import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Employee } from '~/types/aries-proxy/employees';
import { PaymentType } from '~/types/aries-proxy/payment-types';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';

const CashPaymentTypeId = 3;
const CheckPaymentTypeId = 4;

export interface InvoicePaymentFormPayment {
  paymentDate?: number | null;
  paymentTypeId?: number | null;
  notes?: string | null;
  totalPayment?: number | null;
  totalPrepayment?: number | null;
  unsolved?: boolean | null;
  firstNoteEmployeeId?: number | null;
  addTransferTo?: boolean | null;
}

export interface InvoicePaymentFormRequest {
  paidAt: string;
  paymentTypeId: number;
  notes?: string | null;
  unsolved?: boolean | null;
  employeeId?: number | null;
  addTransferTo?: boolean | null;
}

interface InvoicePaymentFormProps {
  counterpartName?: string;
  employees: Employee[];
  heading: string;
  isEmployeesError: boolean;
  isEmployeesLoading: boolean;
  isMobileDialog: boolean;
  isPaymentLoading: boolean;
  isPaymentError: boolean;
  isPaymentTypesLoading: boolean;
  isPaymentTypesError: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (request: InvoicePaymentFormRequest) => Promise<void>;
  payment?: InvoicePaymentFormPayment;
  paymentTypes: PaymentType[];
}

const toInputDate = (unixTimestamp?: number | null) => {
  if (!unixTimestamp) return format(new Date(), 'yyyy-MM-dd');

  return format(getDateByUnixtimestamp({ unixTimestamp }), 'yyyy-MM-dd');
};

const getEmployeeLabel = (employee: Employee) => employee.companyName ?? `#${employee.employeeId}`;

const InvoicePaymentForm = (props: InvoicePaymentFormProps) => {
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  const [unsolved, setUnsolved] = useState(false);
  const [notes, setNotes] = useState('');
  const [employeeId, setEmployeeId] = useState(0);
  const [addTransferTo, setAddTransferTo] = useState(false);

  const isLoading = props.isPaymentLoading || props.isPaymentTypesLoading || props.isEmployeesLoading;
  const hasError = props.isPaymentError || props.isPaymentTypesError || props.isEmployeesError;
  const canManageFirstNote = paymentTypeId === CashPaymentTypeId || paymentTypeId === CheckPaymentTypeId;
  const paymentTypes = useMemo(() => props.paymentTypes, [props.paymentTypes]);
  const selectedEmployee = useMemo(
    () => props.employees.find((employee) => employee.employeeId === employeeId) ?? null,
    [employeeId, props.employees],
  );

  useEffect(() => {
    if (!props.payment) return;

    setPaidAt(toInputDate(props.payment.paymentDate));
    setPaymentTypeId(props.payment.paymentTypeId ?? 0);
    setUnsolved(props.payment.unsolved ?? false);
    setNotes(props.payment.notes ?? '');
    setEmployeeId(props.payment.firstNoteEmployeeId ?? 0);
    setAddTransferTo(props.payment.addTransferTo ?? false);
  }, [props.payment]);

  useEffect(() => {
    if (canManageFirstNote) return;

    setEmployeeId(0);
    setAddTransferTo(false);
  }, [canManageFirstNote]);

  const save = async () => {
    if (!paidAt || paymentTypeId <= 0) return;

    await props.onSave({
      addTransferTo: canManageFirstNote ? addTransferTo : false,
      employeeId: canManageFirstNote && employeeId > 0 ? employeeId : null,
      notes: notes || null,
      paidAt,
      paymentTypeId,
      unsolved,
    });
  };

  return (
    <>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!props.isPaymentLoading && props.isPaymentError ? (
          <Alert severity="error">Non sono riuscito a caricare il pagamento.</Alert>
        ) : null}

        {!props.isPaymentTypesLoading && props.isPaymentTypesError ? (
          <Alert severity="error">Non sono riuscito a caricare i tipi pagamento.</Alert>
        ) : null}

        {!props.isEmployeesLoading && props.isEmployeesError ? (
          <Alert severity="error">Non sono riuscito a caricare i dipendenti.</Alert>
        ) : null}

        {props.payment && !hasError ? (
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Box>
              <Typography fontWeight={700} variant="subtitle1">
                {props.heading}
              </Typography>
              {props.counterpartName ? (
                <Typography color="text.secondary" variant="body2">
                  {props.counterpartName}
                </Typography>
              ) : null}
              <Typography color="text.secondary" variant="body2">
                {formatMoney(newMoney(props.payment.totalPayment ?? 0, 'EUR'))}
              </Typography>
            </Box>

            <TextField
              disabled={props.isSaving}
              fullWidth
              label="Data pagamento"
              onChange={(event) => setPaidAt(event.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              type="date"
              value={paidAt}
            />

            <TextField
              disabled={props.isSaving}
              fullWidth
              label="Tipo pagamento"
              onChange={(event) => setPaymentTypeId(Number(event.target.value))}
              required
              select
              value={paymentTypeId || ''}
            >
              {paymentTypes.map((paymentType) => (
                <MenuItem key={paymentType.id} value={paymentType.id}>
                  {paymentType.name}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={unsolved}
                  disabled={props.isSaving}
                  onChange={(event) => setUnsolved(event.target.checked)}
                />
              }
              label="Insoluto"
            />

            {canManageFirstNote ? (
              <Stack spacing={1.25}>
                <Autocomplete
                  disabled={props.isSaving}
                  getOptionLabel={getEmployeeLabel}
                  isOptionEqualToValue={(option, value) => option.employeeId === value.employeeId}
                  loading={props.isEmployeesLoading}
                  onChange={(_event, value) => {
                    setEmployeeId(value?.employeeId ?? 0);
                    if (!value) setAddTransferTo(false);
                  }}
                  options={props.employees}
                  renderInput={(params) => <TextField {...params} fullWidth label="Cassa dipendente" />}
                  value={selectedEmployee}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={addTransferTo}
                      disabled={props.isSaving || employeeId <= 0}
                      onChange={(event) => setAddTransferTo(event.target.checked)}
                    />
                  }
                  label="Aggiungi trasferimento verso"
                />
              </Stack>
            ) : null}

            <TextField
              disabled={props.isSaving}
              fullWidth
              label="Nota"
              minRows={4}
              multiline
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button disabled={props.isSaving} fullWidth={props.isMobileDialog} onClick={props.onCancel}>
          Annulla
        </Button>
        <Button
          disabled={props.isSaving || isLoading || !paidAt || paymentTypeId <= 0}
          fullWidth={props.isMobileDialog}
          onClick={save}
          startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
          variant="contained"
        >
          Salva
        </Button>
      </DialogActions>
    </>
  );
};

export default InvoicePaymentForm;
