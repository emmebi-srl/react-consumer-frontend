import { useState } from 'react';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import BackButton from '~/components/Layout/BackButton';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import {
  useCarriers,
  useDeleteCarrier,
  useDeleteDeliveryCare,
  useDeleteDeliveryMethod,
  useDeleteTransportCausal,
  useDeliveryCares,
  useDeliveryMethods,
  useDepotTypes,
  useSaveCarrier,
  useSaveDeliveryCare,
  useSaveDeliveryMethod,
  useSaveTransportCausal,
  useTransportCausals,
} from '~/proxies/aries-proxy/ddts';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { DELIVERY_CARE_CARRIER, TransportCausal, TransportCausalOperation } from '~/types/aries-proxy/ddts';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const OPERATIONS: { value: TransportCausalOperation; label: string }[] = [
  { value: TransportCausalOperation.Load, label: 'Carico' },
  { value: TransportCausalOperation.Unload, label: 'Scarico' },
  { value: TransportCausalOperation.LoadFromDepot, label: 'Carico, scaricando il magazzino collegato' },
  { value: TransportCausalOperation.UnloadToDepot, label: 'Scarico, caricando il magazzino collegato' },
];

interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'multiline' | 'checkbox' | 'operation' | 'depot' | 'warranty';
  required?: boolean;
  /** Not editable after creation (e.g. the causal code, primary key). */
  createOnly?: boolean;
}

interface EditDialogProps<T> {
  title: string;
  value: T;
  fields: FieldConfig<T>[];
  isNew: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (value: T) => void;
}

function EditDialog<T extends object>({ title, value, fields, isNew, saving, onClose, onSave }: EditDialogProps<T>) {
  const [draft, setDraft] = useState<T>(value);
  const { data: depotData } = useDepotTypes();
  const set = (key: keyof T, next: unknown) => setDraft((current) => ({ ...current, [key]: next }));
  const read = (key: keyof T) => draft[key] as unknown;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {fields.map((field) => {
            const disabled = field.createOnly && !isNew;
            switch (field.type) {
              case 'checkbox':
                return (
                  <FormControlLabel
                    key={field.key}
                    label={field.label}
                    control={
                      <Checkbox checked={!!read(field.key)} onChange={(_, checked) => set(field.key, checked)} />
                    }
                  />
                );
              case 'operation':
                return (
                  <TextField
                    key={field.key}
                    select
                    label={field.label}
                    value={read(field.key) ?? ''}
                    onChange={(event) => set(field.key, Number(event.target.value))}
                  >
                    {OPERATIONS.map((operation) => (
                      <MenuItem key={operation.value} value={operation.value}>
                        {operation.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              case 'warranty':
                return (
                  <TextField
                    key={field.key}
                    select
                    label={field.label}
                    value={read(field.key) ?? 1}
                    onChange={(event) => set(field.key, Number(event.target.value))}
                  >
                    <MenuItem value={1}>No</MenuItem>
                    <MenuItem value={2}>Sì: il DDT si chiude subito ed è escluso dai totali</MenuItem>
                  </TextField>
                );
              case 'depot':
                return (
                  <TextField
                    key={field.key}
                    select
                    label={field.label}
                    required={field.required}
                    value={read(field.key) ?? ''}
                    onChange={(event) => set(field.key, event.target.value === '' ? null : Number(event.target.value))}
                  >
                    {!field.required ? <MenuItem value="">Nessuno</MenuItem> : null}
                    {(depotData?.depotTypes ?? []).map((depot) => (
                      <MenuItem key={depot.id} value={depot.id}>
                        {depot.name}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              default:
                return (
                  <TextField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    disabled={disabled}
                    multiline={field.type === 'multiline'}
                    minRows={field.type === 'multiline' ? 2 : undefined}
                    value={read(field.key) ?? ''}
                    onChange={(event) => set(field.key, event.target.value)}
                  />
                );
            }
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" disabled={saving} onClick={() => onSave(draft)}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface LookupSectionProps<T> {
  title: string;
  items: T[];
  getKey: (item: T) => string | number;
  isNew: (item: T) => boolean;
  empty: T;
  columns: { label: string; render: (item: T) => React.ReactNode }[];
  fields: FieldConfig<T>[];
  canEdit: boolean;
  canDelete?: (item: T) => boolean;
  onSave: (item: T, isNew: boolean) => Promise<unknown>;
  onDelete: (item: T) => Promise<unknown>;
  describe: (item: T) => string;
}

function LookupSection<T extends object>(props: LookupSectionProps<T>) {
  const snackbar = useSnackbar();
  const modal = useModal();
  const [editing, setEditing] = useState<{ item: T; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (item: T) => {
    if (!editing) return;
    setSaving(true);
    try {
      await props.onSave(item, editing.isNew);
      snackbar.success('Salvato');
      setEditing(null);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: T) => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Elimina', text: `Eliminare "${props.describe(item)}"?` },
    });
    if (answer.action !== 'YES') return;
    try {
      await props.onDelete(item);
      snackbar.success('Eliminato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare.'));
    }
  };

  return (
    <Card variant="outlined">
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="subtitle1">{props.title}</Typography>
        {props.canEdit ? (
          <Button startIcon={<Add />} onClick={() => setEditing({ item: props.empty, isNew: true })}>
            Aggiungi
          </Button>
        ) : null}
      </Stack>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {props.columns.map((column) => (
                <TableCell key={column.label}>{column.label}</TableCell>
              ))}
              {props.canEdit ? <TableCell sx={{ width: 100 }} /> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.items.map((item) => (
              <TableRow key={props.getKey(item)} hover>
                {props.columns.map((column) => (
                  <TableCell key={column.label}>{column.render(item)}</TableCell>
                ))}
                {props.canEdit ? (
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={() => setEditing({ item, isNew: false })}>
                      <Edit fontSize="small" />
                    </IconButton>
                    {!props.canDelete || props.canDelete(item) ? (
                      <IconButton size="small" color="error" onClick={() => void remove(item)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {editing ? (
        <EditDialog
          title={editing.isNew ? `Nuovo: ${props.title}` : `Modifica: ${props.describe(editing.item)}`}
          value={editing.item}
          fields={props.fields}
          isNew={editing.isNew}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={(item) => void save(item)}
        />
      ) : null}
    </Card>
  );
}

/** Support tables of the DDTs (Delphi: causali, porto resa, trasporto a cura, vettori). */
const DdtSettingsView = () => {
  const [tab, setTab] = useState(0);
  const { permission } = useModulePermission(AriesModule.Ddts);
  const canEdit = !!permission?.canEdit;
  const { data: causalData } = useTransportCausals(true);
  const { data: methodData } = useDeliveryMethods();
  const { data: careData } = useDeliveryCares();
  const { data: carrierData } = useCarriers();
  const { data: depotData } = useDepotTypes();
  const saveCausal = useSaveTransportCausal();
  const deleteCausal = useDeleteTransportCausal();
  const saveMethod = useSaveDeliveryMethod();
  const deleteMethod = useDeleteDeliveryMethod();
  const saveCare = useSaveDeliveryCare();
  const deleteCare = useDeleteDeliveryCare();
  const saveCarrier = useSaveCarrier();
  const deleteCarrier = useDeleteCarrier();
  const depotName = (depotId?: number | null) =>
    depotData?.depotTypes.find((depot) => depot.id === depotId)?.name ?? '-';

  const emptyCausal: TransportCausal = {
    id: '',
    name: '',
    description: '',
    operation: TransportCausalOperation.Unload,
    depotId: null,
    defaultDepotId: depotData?.depotTypes.at(0)?.id ?? 1,
    isForReceivedDdts: false,
    isClosed: false,
    warranty: 1,
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <BackButton to={RouteConfig.DdtList.buildLink()} />
          <Typography variant="h4">Tabelle DDT</Typography>
        </Stack>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="Causali di trasporto" />
          <Tab label="Porto resa" />
          <Tab label="Trasporto a cura" />
          <Tab label="Vettori" />
        </Tabs>

        {tab === 0 ? (
          <LookupSection<TransportCausal>
            title="Causali di trasporto"
            items={causalData?.causals ?? []}
            getKey={(item) => item.id}
            isNew={(item) => !item.id}
            empty={emptyCausal}
            canEdit={canEdit}
            describe={(item) => item.name}
            columns={[
              { label: 'Codice', render: (item) => item.id },
              { label: 'Causale', render: (item) => item.name },
              {
                label: 'Operazione',
                render: (item) => OPERATIONS.find((op) => op.value === item.operation)?.label ?? item.operation,
              },
              { label: 'Magazzino default', render: (item) => depotName(item.defaultDepotId) },
              { label: 'Magazzino collegato', render: (item) => depotName(item.depotId) },
              {
                label: 'Note',
                render: (item) => (
                  <Stack direction="row" spacing={0.5}>
                    {item.isClosed ? <Chip size="small" label="Chiusa" /> : null}
                    {item.isForReceivedDdts ? <Chip size="small" variant="outlined" label="DDT ricevuti" /> : null}
                    {item.warranty === 2 ? <Chip size="small" variant="outlined" label="Autoconvalida" /> : null}
                  </Stack>
                ),
              },
            ]}
            fields={[
              { key: 'id', label: 'Codice (max 8)', required: true, createOnly: true },
              { key: 'name', label: 'Causale', required: true },
              { key: 'description', label: 'Descrizione' },
              { key: 'operation', label: 'Operazione di magazzino', type: 'operation' },
              { key: 'defaultDepotId', label: 'Magazzino di default delle righe', type: 'depot', required: true },
              { key: 'depotId', label: 'Magazzino collegato (operazioni 3 e 4)', type: 'depot' },
              { key: 'warranty', label: 'Autoconvalida', type: 'warranty' },
              { key: 'isForReceivedDdts', label: 'Causale dei DDT ricevuti', type: 'checkbox' },
              { key: 'isClosed', label: 'Chiusa (non proposta nei nuovi DDT)', type: 'checkbox' },
            ]}
            onSave={(item, isNew) => saveCausal.mutateAsync({ data: item, isNew })}
            onDelete={(item) => deleteCausal.mutateAsync(item.id)}
          />
        ) : null}

        {tab === 1 ? (
          <LookupSection
            title="Porto resa"
            items={methodData?.deliveryMethods ?? []}
            getKey={(item) => item.id}
            isNew={(item) => !item.id}
            empty={{ id: 0, name: '', description: '' }}
            canEdit={canEdit}
            describe={(item) => item.name}
            columns={[
              { label: 'Nome', render: (item) => item.name },
              { label: 'Descrizione', render: (item) => item.description },
            ]}
            fields={[
              { key: 'name', label: 'Nome', required: true },
              { key: 'description', label: 'Descrizione' },
            ]}
            onSave={(item) => saveMethod.mutateAsync(item)}
            onDelete={(item) => deleteMethod.mutateAsync(item.id)}
          />
        ) : null}

        {tab === 2 ? (
          <LookupSection
            title="Trasporto a cura"
            items={careData?.deliveryCares ?? []}
            getKey={(item) => item.id}
            isNew={(item) => !item.id}
            empty={{ id: 0, name: '', description: '' }}
            canEdit={canEdit}
            describe={(item) => item.name}
            canDelete={(item) => item.id !== DELIVERY_CARE_CARRIER}
            columns={[
              { label: 'Nome', render: (item) => item.name },
              { label: 'Descrizione', render: (item) => item.description },
            ]}
            fields={[
              { key: 'name', label: 'Nome', required: true },
              { key: 'description', label: 'Descrizione' },
            ]}
            onSave={(item) => saveCare.mutateAsync(item)}
            onDelete={(item) => deleteCare.mutateAsync(item.id)}
          />
        ) : null}

        {tab === 3 ? (
          <LookupSection
            title="Vettori"
            items={carrierData?.carriers ?? []}
            getKey={(item) => item.id}
            isNew={(item) => !item.id}
            empty={{ id: 0, name: '' }}
            canEdit={canEdit}
            describe={(item) => item.name ?? `Vettore ${item.id}`}
            columns={[
              { label: 'Nome', render: (item) => item.name },
              { label: 'Codice', render: (item) => item.code },
              { label: 'Telefono', render: (item) => item.phone },
              { label: 'Email', render: (item) => item.email },
              { label: 'Referente', render: (item) => item.contactName },
            ]}
            fields={[
              { key: 'name', label: 'Nome', required: true },
              { key: 'code', label: 'Codice' },
              { key: 'address', label: 'Indirizzo' },
              { key: 'phone', label: 'Telefono' },
              { key: 'fax', label: 'Fax' },
              { key: 'email', label: 'Email' },
              { key: 'contactName', label: 'Referente' },
              { key: 'contactPhone', label: 'Telefono referente' },
              { key: 'contactEmail', label: 'Email referente' },
              { key: 'note', label: 'Note', type: 'multiline' },
            ]}
            onSave={(item) => saveCarrier.mutateAsync(item)}
            onDelete={(item) => deleteCarrier.mutateAsync(item.id)}
          />
        ) : null}
      </Stack>
    </PageContainer>
  );
};

export default DdtSettingsView;
