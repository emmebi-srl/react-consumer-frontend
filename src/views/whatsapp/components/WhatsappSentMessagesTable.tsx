import { Alert, Box, Chip, Link, MenuItem, Stack, TableCell, TextField, Tooltip, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import Metadata from '~/components/Table/Metadata';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useModal } from '~/modals/Modal';
import { useWhatsappSentMessages, useWhatsappSentMessagesMetadata } from '~/proxies/aries-proxy/whatsapp';
import { RouteConfig } from '~/routes/routeConfig';
import {
  WhatsappSentMessage,
  WhatsappSentMessageKind,
  WhatsappSentMessageSearchRequest,
  WhatsappSentStatus,
} from '~/types/aries-proxy/whatsapp';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import WhatsappConversationModal from './WhatsappConversationModal';
import WhatsappSentStatusChip, { whatsappSentStatusLabels } from './WhatsappSentStatusChip';

interface SentFilters {
  search: string;
  kind: WhatsappSentMessageKind | '';
  status: WhatsappSentStatus | '';
}

const defaultFilters: SentFilters = { search: '', kind: '', status: '' };

const kindOptions: { value: WhatsappSentMessageKind; label: string }[] = [
  { value: WhatsappSentMessageKind.Template, label: 'Template campagna' },
  { value: WhatsappSentMessageKind.Reply, label: 'Risposta operatore' },
];

interface SentTableContext {
  onOpen: (message: WhatsappSentMessage) => void;
}

// A click on a row opens the conversation with the number (links inside the row keep working).
const SentTableComponents: TableComponents<WhatsappSentMessage, SentTableContext> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, context, ...props }) => <DataTableRow {...props} onClick={() => context.onOpen(item)} />,
};

const SentFiltersBar: React.FC<{
  filters: SentFilters;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
  onUpdate: <K extends keyof SentFilters>(name: K, value: SentFilters[K]) => void;
}> = ({ filters, filteredCount, totalCount, onReset, onUpdate }) => {
  const isDirty = filters.search !== '' || filters.kind !== '' || filters.status !== '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 1.5,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.300',
      }}
    >
      <CollapsibleFilters onClearFilters={onReset} isDirty={isDirty}>
        <PrimaryFilters dirtyState={filters} additionalFilters={[]}>
          <InlineSearchFilter<SentFilters>
            name="search"
            value={filters.search}
            onChange={onUpdate}
            customLabel="Cerca numero, testo, template, cliente o campagna"
            sx={{ maxWidth: 480 }}
          />
          <TextField
            select
            size="small"
            label="Tipo"
            value={filters.kind}
            onChange={(event) => onUpdate('kind', event.target.value as SentFilters['kind'])}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {kindOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Stato"
            value={filters.status}
            onChange={(event) => onUpdate('status', event.target.value as SentFilters['status'])}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {Object.values(WhatsappSentStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {whatsappSentStatusLabels[status]}
              </MenuItem>
            ))}
          </TextField>
        </PrimaryFilters>
        <AdditionalFilters />
      </CollapsibleFilters>
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

const SentTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataTableHeading
    order="desc"
    orderBy="sendDate"
    rowCount={0}
    headLabel={[
      { id: 'sendDate', label: 'Inviato', align: 'left' },
      { id: 'recipient', label: 'Destinatario', align: 'left' },
      { id: 'text', label: 'Messaggio', align: 'left' },
      { id: 'campaign', label: 'Campagna', align: 'left' },
      { id: 'status', label: 'Stato', align: 'left' },
    ]}
    numSelected={0}
    onRequestSort={() => {}}
    onSelectAllClick={() => {}}
    select={false}
  >
    {children}
  </DataTableHeading>
);

const SentTableRowContent: React.FC<{ message: WhatsappSentMessage }> = ({ message }) => {
  const isTemplate = message.kind === WhatsappSentMessageKind.Template;

  return (
    <>
      <TableCell width={150}>
        <MainLabel>{getStringDateTimeByUnixtimestamp(message.sendDate)}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 180 }}>
        {message.customerId ? (
          <MainLabel>
            <Link
              component={RouterLink}
              to={RouteConfig.CustomerDetail.buildLink({ customerId: String(message.customerId) })}
              underline="hover"
              color="inherit"
              onClick={(event) => event.stopPropagation()}
            >
              {message.customerName ?? `Cliente ${message.customerId}`}
            </Link>
          </MainLabel>
        ) : null}
        <SecondaryLabel>+{message.phone}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ minWidth: 280 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            label={isTemplate ? 'Template' : 'Risposta'}
            color={isTemplate ? 'primary' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: 11, flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {isTemplate ? message.templateName : message.text}
            </Typography>
            {!isTemplate && message.userName ? <SecondaryLabel>da {message.userName}</SecondaryLabel> : null}
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 160 }}>
        {message.campaignId ? (
          <MainLabel>
            <Link
              component={RouterLink}
              to={RouteConfig.CampaignDetail.buildLink({ campaignId: String(message.campaignId) })}
              underline="hover"
              color="inherit"
              onClick={(event) => event.stopPropagation()}
            >
              {message.campaignName ?? `Campagna ${message.campaignId}`}
            </Link>
          </MainLabel>
        ) : (
          <SecondaryLabel>Nessuna campagna</SecondaryLabel>
        )}
      </TableCell>
      <TableCell width={170}>
        <Tooltip
          title={
            message.error ??
            [
              message.deliveryDate ? `Consegnato il ${getStringDateTimeByUnixtimestamp(message.deliveryDate)}` : '',
              message.readDate ? `Letto il ${getStringDateTimeByUnixtimestamp(message.readDate)}` : '',
            ]
              .filter(Boolean)
              .join(' · ')
          }
        >
          <span>
            <WhatsappSentStatusChip status={message.status} />
          </span>
        </Tooltip>
      </TableCell>
    </>
  );
};

/** WhatsApp messages we sent: campaign templates and free text replies of the operators. */
const WhatsappSentMessagesTable = () => {
  const [topReached, setTopReached] = useState(true);
  const [filters, setFilters] = useState<SentFilters>(defaultFilters);
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const modal = useModal();

  const queryParams = useMemo<WhatsappSentMessageSearchRequest>(
    () => ({
      search: filters.search || undefined,
      kind: filters.kind || undefined,
      status: filters.status || undefined,
    }),
    [filters.search, filters.kind, filters.status],
  );
  const messagesQuery = useWhatsappSentMessages(queryParams);
  const metadataQuery = useWhatsappSentMessagesMetadata(queryParams);
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.whatsappSentMessages) ?? [],
    [messagesQuery.data?.pages],
  );

  const tableContext = useMemo<SentTableContext>(
    () => ({
      onOpen: (message) => {
        void modal.showModal({
          component: WhatsappConversationModal,
          props: { phone: message.phone, title: message.customerName ?? undefined },
        });
      },
    }),
    [modal],
  );

  return (
    <>
      {messagesQuery.isError ? <Alert severity="error">Non sono riuscito a caricare i messaggi inviati.</Alert> : null}

      <ScrollToTopButton
        onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
        visible={!topReached}
      />
      <DataTableContainer sx={{ minHeight: 480 }}>
        <TableVirtuoso<WhatsappSentMessage, SentTableContext>
          ref={virtuoso}
          context={tableContext}
          atTopStateChange={setTopReached}
          atTopThreshold={100}
          overscan={{ main: 1000, reverse: 1000 }}
          data={messages}
          components={SentTableComponents}
          endReached={() => {
            if (!messagesQuery.hasNextPage || messagesQuery.isFetching) return;
            void messagesQuery.fetchNextPage();
          }}
          fixedHeaderContent={() => (
            <SentTableHeading>
              <SentFiltersBar
                filters={filters}
                filteredCount={metadataQuery.data?.metadata.filteredCount ?? messages.length}
                totalCount={metadataQuery.data?.metadata.totalCount ?? 0}
                onReset={() => setFilters(defaultFilters)}
                onUpdate={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
              />
            </SentTableHeading>
          )}
          computeItemKey={(_index, message) => `${message.kind}-${message.id}`}
          itemContent={(_index, message) => <SentTableRowContent message={message} />}
        />
      </DataTableContainer>
    </>
  );
};

export default WhatsappSentMessagesTable;
