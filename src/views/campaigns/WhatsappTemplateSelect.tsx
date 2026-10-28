import { createContext, useContext } from 'react';
import { Add, Sync } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  PaperProps,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import _noop from 'lodash/noop';
import { useSyncWhatsappTemplates, useWhatsappTemplates } from '~/proxies/aries-proxy/whatsapp';
import { resolveError } from '~/hooks/useExceptionLogger';
import { useModal } from '~/modals/Modal';
import CreateWhatsappTemplateModal from '~/components/Modals/CreateWhatsappTemplateModal';
import { WhatsappTemplate } from '~/types/aries-proxy/whatsapp';

interface WhatsappTemplateSelectProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  error?: boolean;
  helperText?: string;
}

const AddTemplateContext = createContext<() => void>(_noop);

/** Dropdown of the options with "Aggiungi nuovo template" always visible below the list. */
const PaperWithAddTemplate = ({ children, ...props }: PaperProps) => {
  const onAdd = useContext(AddTemplateContext);

  return (
    <Paper {...props}>
      {children}
      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 0.5 }}>
        <Button
          fullWidth
          startIcon={<Add />}
          sx={{ justifyContent: 'flex-start' }}
          // Keeps the focus on the input, otherwise the list closes before the click.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onAdd}
        >
          Aggiungi nuovo template
        </Button>
      </Box>
    </Paper>
  );
};

const getTemplateLabel = (template: WhatsappTemplate) => `${template.name} (${template.language})`;

/**
 * WhatsApp template of a campaign, chosen among the templates synchronized from WhatsApp Manager.
 * Only usable templates (active and approved) are offered; the current one is kept in the list even
 * when it is no longer usable, so the operator sees why the campaign does not send on WhatsApp.
 */
const WhatsappTemplateSelect: React.FC<WhatsappTemplateSelectProps> = ({ value, onChange, error, helperText }) => {
  const { data, isLoading } = useWhatsappTemplates();
  const sync = useSyncWhatsappTemplates();
  const modal = useModal();

  const templates = (data?.whatsappTemplates ?? []).filter((template) => template.isUsable || template.id === value);
  const selected = templates.find((template) => template.id === value) ?? null;
  const syncError = sync.error ? resolveError(sync.error) : null;

  const resolvedHelperText =
    syncError?.message ??
    helperText ??
    (selected && !selected.isUsable
      ? `Template non utilizzabile (${selected.isActive ? (selected.status ?? 'stato sconosciuto') : 'disattivato'}): la campagna non viene inviata su WhatsApp.`
      : (selected?.description ?? 'Facoltativo. Se vuoto, la campagna è solo email.'));

  const openCreateModal = async () => {
    const result = await modal.showModal({ component: CreateWhatsappTemplateModal, props: {} });
    if (result.action === 'CREATED' && result.result) onChange(result.result.id);
  };

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
      <AddTemplateContext.Provider value={openCreateModal}>
        <Autocomplete
          fullWidth
          options={templates}
          value={selected}
          loading={isLoading}
          onChange={(_event, template) => onChange(template?.id ?? null)}
          getOptionLabel={getTemplateLabel}
          isOptionEqualToValue={(option, current) => option.id === current.id}
          noOptionsText="Nessun template disponibile"
          slots={{ paper: PaperWithAddTemplate }}
          renderOption={({ key, ...optionProps }, template) => (
            <Box component="li" key={key} {...optionProps}>
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  {getTemplateLabel(template)}
                  {template.category ? ` - ${template.category}` : ''}
                </Typography>
                {template.description && (
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {template.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Template WhatsApp"
              placeholder="Nessuno (solo email)"
              error={error || !!syncError || (!!selected && !selected.isUsable)}
              helperText={resolvedHelperText}
            />
          )}
        />
      </AddTemplateContext.Provider>
      <Tooltip title="Sincronizza i template da WhatsApp Manager">
        <span>
          <IconButton onClick={() => sync.mutate()} loading={sync.isPending} sx={{ mt: 1 }}>
            <Sync />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

export default WhatsappTemplateSelect;
