import { Add, DoneAll, Refresh, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  ChipProps,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TextField,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import ListTabs, { ALL_TAB_KEY } from '~/components/Layout/ListTabs';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import EmailComposeModal from '~/components/Modals/EmailComposeModal';
import EmailPreviewModal from '~/components/Modals/EmailPreviewModal';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import Metadata from '~/components/Table/Metadata';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useEmailsMetadata, useEmailsSearch, useEmailStatuses, useResendEmail } from '~/proxies/aries-proxy/emails';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { Email, EmailSearchRequest, EmailStatus, EmailStatusId } from '~/types/aries-proxy/emails';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';

interface EmailFilters {
  search: string;
  statusId: string;
  dateRange: DateRangeValue;
}

/** Status ids (as the `statusId` filter string) that have their own tab. */
const EMAIL_TAB_STATUSES = [String(EmailStatusId.Draft), String(EmailStatusId.Failed)];

const defaultFilters: EmailFilters = {
  search: '',
  statusId: '',
  dateRange: {},
};

// Same meaning as the status dot of the Delphi list.
const statusChipColors: Partial<Record<EmailStatusId, ChipProps['color']>> = {
  [EmailStatusId.Sending]: 'warning',
  [EmailStatusId.Sent]: 'success',
  [EmailStatusId.Failed]: 'error',
  [EmailStatusId.Scheduled]: 'info',
  [EmailStatusId.Canceled]: 'secondary',
};

const EmailTableComponents: TableComponents<Email> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

/** Delphi separates the recipients with ";" or ",", often leaving a trailing separator. */
const splitRecipients = (recipients?: string | null) =>
  (recipients ?? '')
    .split(/[;,]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);

const getRecipients = (email: Email) => [...splitRecipients(email.cc), ...splitRecipients(email.bcc)];

const EmailFiltersBar: React.FC<{
  filters: EmailFilters;
  statuses: EmailStatus[];
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
  onUpdate: <K extends keyof EmailFilters>(name: K, value: EmailFilters[K]) => void;
}> = ({ filters, statuses, filteredCount, totalCount, onReset, onUpdate }) => {
  const isDirty =
    filters.search !== defaultFilters.search ||
    filters.statusId !== defaultFilters.statusId ||
    !!filters.dateRange.startDate;

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
          <InlineSearchFilter<EmailFilters>
            name="search"
            value={filters.search}
            onChange={(name, value) => onUpdate(name, value as EmailFilters[typeof name])}
            customLabel="Cerca oggetto, mittente o destinatario"
            sx={{ maxWidth: 480 }}
          />
          <TextField
            select
            size="small"
            label="Stato"
            value={filters.statusId}
            onChange={(event) => onUpdate('statusId', event.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status.id} value={String(status.id)}>
                {status.name}
              </MenuItem>
            ))}
          </TextField>
          <DateRangePicker value={filters.dateRange} onChange={(value) => onUpdate('dateRange', value)} />
        </PrimaryFilters>
        <AdditionalFilters />
      </CollapsibleFilters>
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

const EmailTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DataTableHeading
      order="desc"
      orderBy="id"
      rowCount={0}
      headLabel={[
        { id: 'sentAt', label: 'Data invio', align: 'left' },
        { id: 'status', label: 'Stato', align: 'left' },
        { id: 'sender', label: 'Mittente', align: 'left' },
        { id: 'recipients', label: 'Destinatari', align: 'left' },
        { id: 'subject', label: 'Oggetto', align: 'left' },
        { id: 'actions', label: '', align: 'right' },
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

const EmailStatusChip: React.FC<{ email: Email }> = ({ email }) => {
  const chip = (
    <Chip
      size="small"
      variant="outlined"
      color={statusChipColors[email.statusId as EmailStatusId] ?? 'default'}
      label={email.status?.name ?? email.statusId}
    />
  );

  return email.statusId === EmailStatusId.Failed && email.errorMessage ? (
    <Tooltip title={email.errorMessage}>{chip}</Tooltip>
  ) : (
    chip
  );
};

const EmailTableRowContent: React.FC<{ email: Email; onPreview: (email: Email) => void }> = ({ email, onPreview }) => {
  const recipients = getRecipients(email);
  // Mails sent to a group have the recipients in the group, not in the mail.
  const recipientsLabel = recipients.join(', ') || email.group?.name || '-';

  return (
    <>
      <TableCell width={150}>
        <MainLabel>{getStringDateTimeByUnixtimestamp(email.sentAt) || '-'}</MainLabel>
      </TableCell>
      <TableCell width={130}>
        <EmailStatusChip email={email} />
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 180 }}>
        <MainLabel title={email.senderUsername ?? undefined}>{email.senderUsername ?? '-'}</MainLabel>
        <SecondaryLabel title={email.senderAddress ?? undefined}>{email.senderAddress}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 220 }}>
        <MainLabel title={recipientsLabel}>{recipientsLabel}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 280 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {email.pec ? <Chip size="small" label="PEC" sx={{ height: 20, fontSize: 11, flexShrink: 0 }} /> : null}
          <MainLabel title={email.subject}>{email.subject || '(senza oggetto)'}</MainLabel>
        </Stack>
      </TableCell>
      <TableCell width={90} align="right">
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          {email.isRead ? (
            <Tooltip title="Letta">
              <DoneAll color="success" fontSize="small" />
            </Tooltip>
          ) : null}
          <Tooltip title="Anteprima">
            <IconButton aria-label="Anteprima email" color="primary" size="small" onClick={() => onPreview(email)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </>
  );
};

/** Every email sent by the users, like the Delphi "Email" screen: list, preview, new email, resend and forward. */
const EmailListView = () => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const resendMutation = useResendEmail();
  const { permission } = useModulePermission(AriesModule.Emails);
  const canSend = !!permission?.canInsert;
  const [topReached, setTopReached] = useState(true);
  const [filters, setFilters] = useState<EmailFilters>(defaultFilters);
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const { startDate, endDate } = filters.dateRange;
  const queryParams = useMemo<EmailSearchRequest>(
    () => ({
      search: filters.search || undefined,
      statusId: filters.statusId ? Number(filters.statusId) : undefined,
      fromDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      toDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    }),
    [filters.search, filters.statusId, startDate, endDate],
  );
  const emailsQuery = useEmailsSearch({ ...queryParams, includes: 'status,group,sender' });
  const metadataQuery = useEmailsMetadata(queryParams);
  const statusesQuery = useEmailStatuses();

  const emails = useMemo(() => emailsQuery.data?.pages.flatMap((page) => page.emails) ?? [], [emailsQuery.data?.pages]);

  const openCompose = (forwardEmailId?: number) => {
    modal.showModal({ component: EmailComposeModal, props: { forwardEmailId } });
  };

  const resend = async (email: Email) => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Reinvia email',
        text: `Reinviare "${email.subject || 'senza oggetto'}" agli stessi destinatari?`,
      },
    });
    if (answer.action !== 'YES') return;

    try {
      const sent = (await resendMutation.mutateAsync(email.id)).emails[0];
      if (sent?.statusId === EmailStatusId.Failed) {
        snackbar.error(sent.errorMessage || "Il server di posta ha rifiutato l'invio.");
      } else {
        snackbar.success('Email reinviata');
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile reinviare l'email."));
    }
  };

  const showPreview = async (email: Email) => {
    const result = await modal.showModal({
      component: EmailPreviewModal,
      props: {
        mailId: email.id,
        recipient: getRecipients(email).join(', ') || undefined,
        allowActions: canSend,
        canResend: email.statusId !== EmailStatusId.Draft,
      },
    });
    if (result.action === 'RESEND') await resend(email);
    if (result.action === 'FORWARD') openCompose(email.id);
  };

  return (
    <PageContainer>
      <Stack spacing={3} direction="column" sx={{ flexGrow: 1, minHeight: 0 }}>
        <ListTabs
          tabs={[
            { key: ALL_TAB_KEY, label: 'Tutte' },
            { key: String(EmailStatusId.Draft), label: 'Bozze' },
            { key: String(EmailStatusId.Failed), label: 'Fallite' },
          ]}
          // Another status picked in "Più filtri" leaves "Tutte" highlighted.
          selectedTabKey={EMAIL_TAB_STATUSES.includes(filters.statusId) ? filters.statusId : ALL_TAB_KEY}
          onSelect={(tab) =>
            setFilters((current) => ({ ...current, statusId: tab.key === ALL_TAB_KEY ? '' : tab.key }))
          }
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  emailsQuery.refetch();
                  metadataQuery.refetch();
                }}
                disabled={emailsQuery.isFetching || metadataQuery.isFetching}
              >
                Aggiorna
              </Button>
              {canSend ? (
                <Button variant="contained" startIcon={<Add />} onClick={() => openCompose()}>
                  Nuova email
                </Button>
              ) : null}
            </>
          }
        />

        {emailsQuery.isError ? <Alert severity="error">Non sono riuscito a caricare le email.</Alert> : null}

        <ScrollToTopButton
          onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
          visible={!topReached}
        />
        <DataTableContainer sx={{ minHeight: 480 }}>
          <TableVirtuoso<Email>
            ref={virtuoso}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{ main: 1000, reverse: 1000 }}
            data={emails}
            components={EmailTableComponents}
            endReached={() => {
              if (!emailsQuery.hasNextPage || emailsQuery.isFetching) {
                return;
              }

              emailsQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <EmailTableHeading>
                <EmailFiltersBar
                  filters={filters}
                  statuses={statusesQuery.data?.statuses ?? []}
                  filteredCount={metadataQuery.data?.metadata.filteredCount ?? emails.length}
                  totalCount={metadataQuery.data?.metadata.totalCount ?? 0}
                  onReset={() => setFilters(defaultFilters)}
                  onUpdate={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
                />
              </EmailTableHeading>
            )}
            computeItemKey={(_index, email) => email.id}
            itemContent={(_index, email) => <EmailTableRowContent email={email} onPreview={showPreview} />}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};

export default EmailListView;
