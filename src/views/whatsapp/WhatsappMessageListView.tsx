import { Refresh } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  MenuItem,
  Stack,
  TableCell,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import PageContainer from '~/components/Layout/PageContainer';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import Metadata from '~/components/Table/Metadata';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useWhatsappReceivedMessages, useWhatsappReceivedMessagesMetadata } from '~/proxies/aries-proxy/whatsapp';
import { RouteConfig } from '~/routes/routeConfig';
import {
  WhatsappNotificationStatus,
  WhatsappReceivedMessage,
  WhatsappReceivedMessageSearchRequest,
} from '~/types/aries-proxy/whatsapp';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';

interface MessageFilters {
  search: string;
  notificationStatus: WhatsappNotificationStatus | '';
}

const defaultFilters: MessageFilters = {
  search: '',
  notificationStatus: '',
};

const notificationStatusOptions: { value: WhatsappNotificationStatus; label: string }[] = [
  { value: WhatsappNotificationStatus.Sent, label: 'Inoltrato' },
  { value: WhatsappNotificationStatus.Pending, label: 'In attesa' },
  { value: WhatsappNotificationStatus.Failed, label: 'Fallito' },
];

// Media and other non-text messages are stored without text: show what the customer sent.
const messageTypeLabels: Record<string, string> = {
  image: 'Immagine',
  audio: 'Audio',
  video: 'Video',
  document: 'Documento',
  sticker: 'Sticker',
  location: 'Posizione',
  contacts: 'Contatto',
  reaction: 'Reazione',
};

const MessageTableComponents: TableComponents<WhatsappReceivedMessage> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const MessageFiltersBar: React.FC<{
  filters: MessageFilters;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
  onUpdate: <K extends keyof MessageFilters>(name: K, value: MessageFilters[K]) => void;
}> = ({ filters, filteredCount, totalCount, onReset, onUpdate }) => {
  const isDirty =
    filters.search !== defaultFilters.search || filters.notificationStatus !== defaultFilters.notificationStatus;

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
          <InlineSearchFilter<MessageFilters>
            name="search"
            value={filters.search}
            onChange={onUpdate}
            customLabel="Cerca mittente, testo, cliente o campagna"
            sx={{ maxWidth: 480 }}
          />
          <TextField
            select
            size="small"
            label="Inoltro email"
            value={filters.notificationStatus}
            onChange={(event) =>
              onUpdate('notificationStatus', event.target.value as MessageFilters['notificationStatus'])
            }
            sx={{ width: 220 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {notificationStatusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
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

const MessageTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DataTableHeading
      order="desc"
      orderBy="receivedDate"
      rowCount={0}
      headLabel={[
        { id: 'receivedDate', label: 'Ricevuto', align: 'left' },
        { id: 'sender', label: 'Mittente', align: 'left' },
        { id: 'text', label: 'Messaggio', align: 'left' },
        { id: 'customer', label: 'Cliente', align: 'left' },
        { id: 'campaign', label: 'Campagna', align: 'left' },
        { id: 'notification', label: 'Inoltro email', align: 'left' },
      ]}
      numSelected={0}
      onRequestSort={() => {}}
      onSelectAllClick={() => {}}
      select={false}
    >
      {children}
    </DataTableHeading>
  );
};

const NotificationChip: React.FC<{ message: WhatsappReceivedMessage }> = ({ message }) => {
  if (message.notificationStatus === WhatsappNotificationStatus.Sent) {
    return (
      <Tooltip title={`Inoltrato il ${getStringDateTimeByUnixtimestamp(message.notificationDate)}`}>
        <Chip size="small" color="success" variant="outlined" label="Inoltrato" />
      </Tooltip>
    );
  }

  const isFailed = message.notificationStatus === WhatsappNotificationStatus.Failed;
  return (
    <Tooltip title={message.notificationError ?? ''}>
      <Chip
        size="small"
        color={isFailed ? 'error' : message.notificationAttempts > 0 ? 'warning' : 'default'}
        variant="outlined"
        label={
          isFailed
            ? 'Fallito'
            : `In attesa${message.notificationAttempts > 0 ? ` (${message.notificationAttempts} tentativi)` : ''}`
        }
      />
    </Tooltip>
  );
};

const MessageTableRowContent: React.FC<{ message: WhatsappReceivedMessage }> = ({ message }) => {
  const isButton = message.type === 'button';
  const text = message.text || messageTypeLabels[message.type] || `Messaggio di tipo "${message.type}"`;

  return (
    <>
      <TableCell width={150}>
        <MainLabel>{getStringDateTimeByUnixtimestamp(message.receivedDate)}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 160 }}>
        <MainLabel>{message.senderName || message.senderPhone}</MainLabel>
        {message.senderName ? <SecondaryLabel>{message.senderPhone}</SecondaryLabel> : null}
      </TableCell>
      <TableCell sx={{ minWidth: 280 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          {isButton ? <Chip size="small" label="Pulsante" sx={{ height: 20, fontSize: 11, flexShrink: 0 }} /> : null}
          <Typography
            variant="body2"
            color={message.text ? 'textPrimary' : 'textSecondary'}
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {text}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 180 }}>
        {message.customerId ? (
          <>
            <MainLabel>
              <Link
                component={RouterLink}
                to={RouteConfig.CustomerDetail.buildLink({ customerId: String(message.customerId) })}
                underline="hover"
                color="inherit"
              >
                {message.customer?.companyName ?? `Cliente ${message.customerId}`}
              </Link>
            </MainLabel>
            <SecondaryLabel>
              {message.systemId ? (message.system?.description ?? `Impianto ${message.systemId}`) : 'Nessun impianto'}
            </SecondaryLabel>
          </>
        ) : (
          <SecondaryLabel>Non riconosciuto</SecondaryLabel>
        )}
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 160 }}>
        {message.campaignId ? (
          <MainLabel>
            <Link
              component={RouterLink}
              to={RouteConfig.CampaignDetail.buildLink({ campaignId: String(message.campaignId) })}
              underline="hover"
              color="inherit"
            >
              {message.campaign?.name ?? `Campagna ${message.campaignId}`}
            </Link>
          </MainLabel>
        ) : (
          <SecondaryLabel>Nessuna campagna</SecondaryLabel>
        )}
      </TableCell>
      <TableCell width={190}>
        <NotificationChip message={message} />
      </TableCell>
    </>
  );
};

/** Messages written by the customers on WhatsApp: replies to the campaigns and button presses. */
const WhatsappMessageListView = () => {
  const [topReached, setTopReached] = useState(true);
  const [filters, setFilters] = useState<MessageFilters>(defaultFilters);
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const queryParams = useMemo<WhatsappReceivedMessageSearchRequest>(
    () => ({
      search: filters.search || undefined,
      notificationStatus: filters.notificationStatus || undefined,
    }),
    [filters.search, filters.notificationStatus],
  );
  const messagesQuery = useWhatsappReceivedMessages({ ...queryParams, includes: 'customer,system,campaign' });
  const metadataQuery = useWhatsappReceivedMessagesMetadata(queryParams);

  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.whatsappReceivedMessages) ?? [],
    [messagesQuery.data?.pages],
  );

  return (
    <PageContainer>
      <Stack spacing={3} direction="column" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h4">Messaggi WhatsApp ricevuti</Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              messagesQuery.refetch();
              metadataQuery.refetch();
            }}
            disabled={messagesQuery.isFetching || metadataQuery.isFetching}
          >
            Aggiorna
          </Button>
        </Stack>

        {messagesQuery.isError ? <Alert severity="error">Non sono riuscito a caricare i messaggi.</Alert> : null}

        <ScrollToTopButton
          onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
          visible={!topReached}
        />
        <DataTableContainer sx={{ minHeight: 480 }}>
          <TableVirtuoso<WhatsappReceivedMessage>
            ref={virtuoso}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{ main: 1000, reverse: 1000 }}
            data={messages}
            components={MessageTableComponents}
            endReached={() => {
              if (!messagesQuery.hasNextPage || messagesQuery.isFetching) {
                return;
              }

              messagesQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <MessageTableHeading>
                <MessageFiltersBar
                  filters={filters}
                  filteredCount={metadataQuery.data?.metadata.filteredCount ?? messages.length}
                  totalCount={metadataQuery.data?.metadata.totalCount ?? 0}
                  onReset={() => setFilters(defaultFilters)}
                  onUpdate={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
                />
              </MessageTableHeading>
            )}
            computeItemKey={(_index, message) => message.id}
            itemContent={(_index, message) => <MessageTableRowContent message={message} />}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};

export default WhatsappMessageListView;
