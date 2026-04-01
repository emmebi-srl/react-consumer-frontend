import { ArrowBack, Refresh } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import moment from 'moment';
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
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import {
  useCampaignById,
  useCampaignMailStatuses,
  useCampaignMails,
  useCampaignMailsMetadata,
} from '~/proxies/aries-proxy/campaigns';
import { RouteConfig } from '~/routes/routeConfig';
import { CampaignMail, CampaignMailSearchRequest } from '~/types/aries-proxy/campaigns';
import { getReadableTextColor, normalizeToHexColor } from '~/utils/color-utils';

interface CampaignMailFilters {
  search: string;
  status: string;
}

const defaultFilters: CampaignMailFilters = {
  search: '',
  status: '',
};

const CampaignMailTableComponents: TableComponents<CampaignMail> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const getCampaignStateLabel = (active: boolean | undefined) => {
  if (active === undefined) {
    return 'N/D';
  }

  return active ? 'Attiva' : 'Disattiva';
};

const getCampaignMailStatusLabel = (mail: Pick<CampaignMail, 'status'>) => {
  return mail.status?.name || 'Senza stato';
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '-';
  }

  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '-';
};

const getStatusCount = (
  statusCounts: { statusApplicationReference?: string | null; totalCount: number }[] | undefined,
  statusValue: string,
) => {
  return (
    statusCounts?.find((status) => status.statusApplicationReference?.toLowerCase() === statusValue.toLowerCase())
      ?.totalCount ?? 0
  );
};

const StatCard: React.FC<{ label: string; value: number | string }> = ({ label, value }) => {
  return (
    <Box
      sx={{
        minWidth: 160,
        flex: '1 1 160px',
        borderRadius: 2,
        bgcolor: 'grey.100',
        px: 2,
        py: 1.5,
      }}
    >
      <SecondaryLabel>{label}</SecondaryLabel>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
};

const CampaignMailFiltersBar: React.FC<{
  filters: CampaignMailFilters;
  isDirty: boolean;
  filteredCount: number;
  totalCount: number;
  statusOptions: { value: string; label: string }[];
  onReset: () => void;
  onUpdate: <K extends keyof CampaignMailFilters>(name: K, value: CampaignMailFilters[K]) => void;
}> = ({ filters, isDirty, filteredCount, totalCount, statusOptions, onReset, onUpdate }) => {
  return (
    <Box display="flex" flexDirection="column" pt={1.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.300">
      <CollapsibleFilters onClearFilters={onReset} isDirty={isDirty}>
        <PrimaryFilters dirtyState={filters} additionalFilters={['status']}>
          <InlineSearchFilter<CampaignMailFilters>
            name="search"
            value={filters.search}
            onChange={onUpdate}
            customLabel="Cerca cliente o impianto"
            sx={{ maxWidth: 480 }}
          />
        </PrimaryFilters>
        <AdditionalFilters>
          <TextField
            select
            size="small"
            label="Stato"
            value={filters.status}
            onChange={(event) => onUpdate('status', event.target.value)}
            sx={{ width: 220 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </AdditionalFilters>
      </CollapsibleFilters>
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

const CampaignMailTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DataTableHeading
      order="asc"
      orderBy="id"
      rowCount={0}
      headLabel={[
        { id: 'id', label: 'ID', align: 'right' },
        { id: 'status', label: 'Stato', align: 'left' },
        { id: 'customer', label: 'Cliente', align: 'left' },
        { id: 'system', label: 'Impianto', align: 'left' },
        { id: 'email', label: 'Email', align: 'left' },
        { id: 'sendDate', label: 'Invio', align: 'right' },
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

const CampaignMailTableRowContent: React.FC<{ mail: CampaignMail }> = ({ mail }) => {
  const customerName = mail.customer?.companyName ?? `Cliente ${mail.customerId}`;
  const systemDescription = mail.system?.description ?? (mail.systemId ? `Impianto ${mail.systemId}` : 'N/D');
  const systemType = mail.system?.typeDescription ?? '';
  const statusLabel = getCampaignMailStatusLabel(mail);
  const statusColor = normalizeToHexColor(mail.status?.color);

  return (
    <>
      <TableCell align="right" width={90}>
        <MainLabel>{mail.id}</MainLabel>
      </TableCell>
      <TableCell width={160}>
        <Stack direction="column" spacing={0.5}>
          <Chip
            size="small"
            label={statusLabel}
            sx={
              statusColor
                ? {
                    bgcolor: statusColor,
                    color: getReadableTextColor(statusColor),
                    fontWeight: 600,
                  }
                : undefined
            }
          />
        </Stack>
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <MainLabel>{customerName}</MainLabel>
        <SecondaryLabel>Cliente #{mail.customerId}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <MainLabel>{systemDescription}</MainLabel>
        <SecondaryLabel>
          {mail.systemId ? `Impianto #${mail.systemId}${systemType ? ` - ${systemType}` : ''}` : 'Nessun impianto'}
        </SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <MainLabel>{mail.email}</MainLabel>
        <SecondaryLabel>{mail.processingError || ''}</SecondaryLabel>
      </TableCell>
      <TableCell align="right" width={200}>
        <MainLabel>{formatDateTime(mail.sendDate)}</MainLabel>
      </TableCell>
    </>
  );
};

const CampaignDetailView = () => {
  const params = useParams<{ campaignId: string }>();
  const campaignId = Number(params.campaignId);
  const [topReached, setTopReached] = useState(true);
  const [filters, setFilters] = useState<CampaignMailFilters>(defaultFilters);
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const campaignQuery = useCampaignById(campaignId, { includes: 'campaign_type' });
  const queryParams = useMemo<CampaignMailSearchRequest>(
    () => ({
      search: filters.search || undefined,
      status: filters.status || undefined,
      includes: 'customer,system,status',
    }),
    [filters.search, filters.status],
  );
  const campaignMailStatusesQuery = useCampaignMailStatuses();
  const campaignMailMetadataQuery = useCampaignMailsMetadata(campaignId);
  const campaignMailsQuery = useCampaignMails(campaignId, queryParams);

  const campaign = campaignQuery.data?.campaigns[0];
  const campaignMails = useMemo(
    () => campaignMailsQuery.data?.pages.flatMap((page) => page.campaignMails) ?? [],
    [campaignMailsQuery.data?.pages],
  );
  const campaignMailMetadata = campaignMailMetadataQuery.data?.metadata;

  const summary = useMemo(() => {
    return {
      recipientsCount: campaignMailMetadata?.recipientsCount ?? 0,
      positiveCount: getStatusCount(campaignMailMetadata?.statusCounts, 'positive_outcome'),
      negativeCount: getStatusCount(campaignMailMetadata?.statusCounts, 'negative_outcome'),
      mailsCount: campaignMailMetadata?.totalCount ?? 0,
    };
  }, [campaignMailMetadata]);

  const campaignMailStatusOptions = useMemo(
    () =>
      (campaignMailStatusesQuery.data?.statuses ?? [])
        .filter((status) => !!status.applicationReference)
        .map((status) => ({
          value: status.applicationReference ?? '',
          label: status.name,
        })),
    [campaignMailStatusesQuery.data?.statuses],
  );

  const isPageLoading =
    campaignQuery.isLoading ||
    campaignMailStatusesQuery.isLoading ||
    campaignMailMetadataQuery.isLoading ||
    campaignMailsQuery.isLoading;
  const hasPageError =
    campaignQuery.isError ||
    campaignMailStatusesQuery.isError ||
    campaignMailMetadataQuery.isError ||
    campaignMailsQuery.isError;
  const isDirty = filters.search !== defaultFilters.search || filters.status !== defaultFilters.status;

  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return <Navigate to={RouteConfig.CampaignList.buildLink()} replace />;
  }

  return (
    <PageContainer>
      <Stack spacing={3} direction="column" flexGrow={1} minHeight={0}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              component={RouterLink}
              to={RouteConfig.CampaignList.buildLink()}
              color="primary"
              aria-label="Torna alle campagne"
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4">Dettaglio campagna</Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              campaignQuery.refetch();
              campaignMailStatusesQuery.refetch();
              campaignMailMetadataQuery.refetch();
              campaignMailsQuery.refetch();
            }}
            disabled={
              campaignQuery.isFetching ||
              campaignMailStatusesQuery.isFetching ||
              campaignMailMetadataQuery.isFetching ||
              campaignMailsQuery.isFetching
            }
          >
            Aggiorna
          </Button>
        </Stack>

        {isPageLoading && !campaign ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : null}

        {hasPageError ? (
          <Alert severity="error">Non sono riuscito a caricare il dettaglio della campagna.</Alert>
        ) : null}

        {campaign ? (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Campagna #{campaign.id}
                    </Typography>
                    <Typography variant="h5">{campaign.name}</Typography>
                    <Typography color="text.secondary">{campaign.description || 'Nessuna descrizione'}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
                    <Chip
                      label={getCampaignStateLabel(campaign.active)}
                      color={campaign.active ? 'success' : 'default'}
                    />
                    {campaign.campaignType?.name ? (
                      <Chip label={campaign.campaignType.name} variant="outlined" />
                    ) : null}
                  </Stack>
                </Stack>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <StatCard label="Destinatari contattati" value={summary.recipientsCount} />
                  <StatCard label="Mail in campagna" value={summary.mailsCount} />
                  <StatCard label="Riscontro positivo" value={summary.positiveCount} />
                  <StatCard label="Riscontro negativo" value={summary.negativeCount} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <ScrollToTopButton
          onClick={() =>
            virtuoso.current?.scrollToIndex({
              index: 0,
              align: 'start',
              behavior: 'smooth',
            })
          }
          visible={!topReached}
        />
        <DataTableContainer sx={{ minHeight: 480 }}>
          <TableVirtuoso<CampaignMail>
            ref={virtuoso}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{
              main: 1000,
              reverse: 1000,
            }}
            data={campaignMails}
            components={CampaignMailTableComponents}
            endReached={() => {
              if (!campaignMailsQuery.hasNextPage || campaignMailsQuery.isFetching) {
                return;
              }

              campaignMailsQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <CampaignMailTableHeading>
                <CampaignMailFiltersBar
                  filters={filters}
                  filteredCount={campaignMails.length}
                  totalCount={summary.mailsCount}
                  isDirty={isDirty}
                  statusOptions={campaignMailStatusOptions}
                  onReset={() => setFilters(defaultFilters)}
                  onUpdate={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
                />
              </CampaignMailTableHeading>
            )}
            computeItemKey={(_index, mail) => mail.id}
            itemContent={(_index, mail) => <CampaignMailTableRowContent mail={mail} />}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};

export default CampaignDetailView;
