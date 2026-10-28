import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { resolveError } from '~/hooks/useExceptionLogger';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useCreateWhatsappTemplate } from '~/proxies/aries-proxy/whatsapp';
import { WhatsappTemplate } from '~/types/aries-proxy/whatsapp';

interface CreateWhatsappTemplateModalProps extends ModalProps {
  closeModal: (props?: { action: 'CLOSE' } | { action: 'CREATED'; result: WhatsappTemplate | null }) => void;
}

// Same rules as WhatsApp Manager.
const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome obbligatorio')
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'Solo lettere minuscole, numeri e underscore, come in WhatsApp Manager'),
  language: z
    .string()
    .trim()
    .regex(/^[a-z]{2,3}(_[A-Z]{2})?$/, 'Codice lingua non valido (es. it, en_US)'),
  description: z.string().trim().max(500),
});

type FormValues = z.infer<typeof FormSchema>;

const CreateWhatsappTemplateModal = (props: CreateWhatsappTemplateModalProps) => {
  const snackbar = useSnackbar();
  const createMutation = useCreateWhatsappTemplate();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', language: 'it', description: '' },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await createMutation.mutateAsync({
        name: values.name,
        language: values.language,
        description: values.description || null,
      });
      snackbar.success('Template WhatsApp aggiunto');
      props.closeModal({ action: 'CREATED', result: result.whatsappTemplates[0] ?? null });
    } catch {
      // Shown in the alert.
    }
  });

  const resolvedError = createMutation.error ? resolveError(createMutation.error) : null;

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Aggiungi template WhatsApp</DialogTitle>
      <DialogContent>
        <Stack component="form" id="whatsapp-template-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <DialogContentText>
            Il template deve essere già stato creato in WhatsApp Manager: inserisci lo stesso nome e la stessa lingua.
            Categoria e stato di approvazione vengono letti da Meta.
          </DialogContentText>
          <TextField
            {...form.register('name')}
            label="Nome"
            fullWidth
            autoFocus
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message ?? 'Es. proposta_abbonamento'}
          />
          <TextField
            {...form.register('language')}
            label="Lingua"
            fullWidth
            error={!!form.formState.errors.language}
            helperText={form.formState.errors.language?.message ?? 'Codice lingua del template, es. it'}
          />
          <TextField
            {...form.register('description')}
            label="Descrizione"
            fullWidth
            multiline
            minRows={3}
            error={!!form.formState.errors.description}
            helperText={
              form.formState.errors.description?.message ?? 'Facoltativa. Se vuota, usa il testo del template.'
            }
          />
          {resolvedError && (
            <Alert severity="error">
              <AlertTitle>{resolvedError.title}</AlertTitle>
              {resolvedError.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annulla</Button>
        <Button type="submit" form="whatsapp-template-form" variant="contained" loading={createMutation.isPending}>
          Aggiungi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWhatsappTemplateModal;
