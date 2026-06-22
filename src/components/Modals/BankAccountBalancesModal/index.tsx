import { Add, Delete } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps, useModal } from '~/modals/Modal';
import {
  useBankAccountBalances,
  useCreateBankAccountBalance,
  useDeleteBankAccountBalance,
} from '~/proxies/aries-proxy/company';
import { Bank, BankAccount, BankAccountBalance } from '~/types/aries-proxy/company';
import ConfirmationModal from '../ConfirmationModal';

interface BalanceDraft {
  amount: string;
  balanceDate: string;
  notes: string;
}

interface BankAccountBalancesModalProps extends ModalProps {
  account: BankAccount;
}

const todayInputValue = () => new Date().toISOString().slice(0, 10);
const emptyBalanceDraft = (): BalanceDraft => ({ amount: '', balanceDate: todayInputValue(), notes: '' });
const inputDateToUnix = (value: string) => Math.floor(new Date(`${value}T00:00:00`).getTime() / 1000);
const nullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};
const formatDate = (value?: number | null) => (value ? new Date(value * 1000).toLocaleDateString('it-IT') : '-');
const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('it-IT', { currency: 'EUR', style: 'currency' }).format(value ?? 0);
const formatBankLabel = (bank?: Bank | null) => [bank?.name, bank?.abi].filter(Boolean).join(' - ');

const BankAccountBalancesModal = ({ account, closeModal }: BankAccountBalancesModalProps) => {
  const snackbar = useSnackbar();
  const modal = useModal();
  const accountId = account.id ?? 0;
  const { data: balances = [], isLoading } = useBankAccountBalances(accountId);
  const { mutateAsync: createBalance, isPending: isCreatingBalance } = useCreateBankAccountBalance();
  const { mutateAsync: deleteBalance, isPending: isDeletingBalance } = useDeleteBankAccountBalance();
  const [draft, setDraft] = useState<BalanceDraft>(emptyBalanceDraft());

  useEffect(() => {
    setDraft(emptyBalanceDraft());
  }, [accountId]);

  const close = () => closeModal({ action: 'CLOSE' });

  const handleDraftChange = (name: keyof BalanceDraft, value: string) => {
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleCreateBalance = async () => {
    const amount = Number(draft.amount.replace(',', '.'));

    if (!accountId || !draft.balanceDate || !Number.isFinite(amount)) {
      snackbar.error('Data e saldo sono obbligatori.');
      return;
    }

    await createBalance({
      id: accountId,
      model: {
        balanceDate: inputDateToUnix(draft.balanceDate),
        amount,
        notes: nullableText(draft.notes),
      },
    });
    setDraft(emptyBalanceDraft());
    snackbar.success('Saldo inserito.');
  };

  const handleDeleteBalance = async (balance: BankAccountBalance) => {
    if (!accountId || !balance.id) return;

    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina saldo',
        text: `Il saldo del ${formatDate(balance.balanceDate)} verra eliminato.`,
        alertSeverity: 'warning',
      },
    });

    if (result.action !== 'YES') return;

    await deleteBalance({ id: accountId, balanceId: balance.id });
    snackbar.success('Saldo eliminato.');
  };

  return (
    <Dialog fullWidth maxWidth="md" onClose={close} open>
      <DialogTitle>Saldi conto bancario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box>
            <Typography fontWeight={700}>{account.name}</Typography>
            <Typography color="text.secondary" variant="body2">
              {[formatBankLabel(account.bank), account.iban].filter(Boolean).join(' - ') || '-'}
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Data saldo"
                onChange={(event) => handleDraftChange('balanceDate', event.target.value)}
                size="small"
                type="date"
                value={draft.balanceDate}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                inputProps={{ inputMode: 'decimal' }}
                label="Saldo"
                onChange={(event) => handleDraftChange('amount', event.target.value)}
                size="small"
                value={draft.amount}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Nota"
                onChange={(event) => handleDraftChange('notes', event.target.value)}
                size="small"
                value={draft.notes}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                disabled={!accountId || isCreatingBalance}
                fullWidth
                onClick={handleCreateBalance}
                startIcon={<Add />}
                sx={{ height: 40 }}
                variant="contained"
              >
                Inserisci
              </Button>
            </Grid>
          </Grid>

          {isLoading ? <Alert severity="info">Caricamento saldi...</Alert> : null}
          {!isLoading && balances.length === 0 ? <Alert severity="info">Nessun saldo inserito.</Alert> : null}

          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            <Stack spacing={1}>
              {balances.map((balance) => (
                <Box
                  key={balance.id ?? `${balance.balanceDate}-${balance.amount}`}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    justifyContent: 'space-between',
                    p: 1,
                  }}
                >
                  <Box>
                    <Typography fontWeight={700}>{formatCurrency(balance.amount)}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {formatDate(balance.balanceDate)}
                      {balance.notes ? ` - ${balance.notes}` : ''}
                    </Typography>
                  </Box>
                  <IconButton
                    color="error"
                    disabled={!balance.id || isDeletingBalance}
                    onClick={() => handleDeleteBalance(balance)}
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankAccountBalancesModal;
