import { Add, ArrowBack, Delete, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TableCell,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import CreateSupplierInvoicePeriodicConfigurationModal from '~/components/Modals/CreateSupplierInvoicePeriodicConfigurationModal';
import PageContainer from '~/components/Layout/PageContainer';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import Metadata from '~/components/Table/Metadata';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import {
  useDeleteSupplierInvoicePeriodicConfiguration,
  useSupplierInvoicePeriodicConfigurationsSearch,
  useUpdateSupplierInvoicePeriodicConfiguration,
} from '~/proxies/aries-proxy/supplier-invoices';
import { RouteConfig } from '~/routes/routeConfig';
import { SupplierInvoicePeriodicConfiguration } from '~/types/aries-proxy/supplier-invoices';
import { formatMoney } from '~/utils/money';

interface Filters {
  search: string;
  enabled?: boolean;
}

const TableComponentsConfig: TableComponents<SupplierInvoicePeriodicConfiguration> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const PeriodUnitLabels: Record<string, string> = {
  week: 'settimane',
  month: 'mesi',
  year: 'anni',
};

const formatDate = (value?: string | number | null) => {
  if (!value) return '-';
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return new Intl.DateTimeFormat('it-IT').format(date);
};

const formatCurrency = (value: number) => formatMoney({ amount: value.toString(), currency: 'EUR' });

const TableHeading: React.FC<{ children: React.ReactNode | React.ReactElement }> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'supplier', label: 'Fornitore', align: 'left' },
    { id: 'amount', label: 'Importo', align: 'right' },
    { id: 'description', label: 'Descrizione', align: 'left' },
    { id: 'period', label: 'Periodicità', align: 'left' },
    { id: 'dates', label: 'Periodo', align: 'left' },
    { id: 'enabled', label: 'Abilitata', align: 'center' },
    { id: 'actions', label: 'Azioni', align: 'right' },
  ];

  return (
    <DataTableHeading
      order="desc"
      orderBy="id"
      headLabel={head}
      numSelected={0}
      rowCount={0}
      onRequestSort={() => {}}
      onSelectAllClick={() => {}}
      select={false}
    >
      {children}
    </DataTableHeading>
  );
};

interface PeriodicConfigurationBarProps {
  filters: Filters;
  onChange: <K extends keyof Filters>(name: K, value: Filters[K]) => void;
  onReset: () => void;
  resultCount: number;
}

const PeriodicConfigurationBar: React.FC<PeriodicConfigurationBarProps> = ({
  filters,
  onChange,
  onReset,
  resultCount,
}) => {
  const theme = useTheme();
  const dirtyState = {
    search: Boolean(filters.search),
    enabled: filters.enabled !== undefined,
  };
  const isDirty = Object.values(dirtyState).some(Boolean);

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1.5}
      bgcolor="white"
      borderBottom="1px solid"
      borderColor={theme.palette.grey[300]}
    >
      <CollapsibleFilters onClearFilters={onReset} isDirty={isDirty}>
        <PrimaryFilters dirtyState={dirtyState} additionalFilters={['enabled']}>
          <InlineSearchFilter<Filters>
            name="search"
            value={filters.search}
            onChange={(name, value) => onChange(name, value)}
            sx={{
              maxWidth: 410,
            }}
          />
        </PrimaryFilters>
        <AdditionalFilters>
          <TextField
            select
            size="small"
            label="Abilitata"
            value={filters.enabled === undefined ? '' : String(filters.enabled)}
            onChange={(event) => {
              const value = event.target.value;
              onChange('enabled', value === '' ? undefined : value === 'true');
            }}
            sx={{ width: 180 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            <MenuItem value="true">Si</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
        </AdditionalFilters>
      </CollapsibleFilters>
      <Metadata filteredCount={resultCount} totalCount={resultCount} />
    </Box>
  );
};

const SupplierInvoicePeriodicConfigurationListView = () => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: '' });
  const updateMutation = useUpdateSupplierInvoicePeriodicConfiguration();
  const deleteMutation = useDeleteSupplierInvoicePeriodicConfiguration();

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      enabled: filters.enabled,
      includes: 'supplier',
    }),
    [filters.enabled, filters.search],
  );

  const configurationsQuery = useSupplierInvoicePeriodicConfigurationsSearch(queryParams);
  const configurations = configurationsQuery.data?.pages.flatMap((page) => page.periodicConfigurations) ?? [];

  const updateFilter = <K extends keyof Filters>(name: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '' });
  };

  const openCreateModal = () => {
    modal.showModal({
      component: CreateSupplierInvoicePeriodicConfigurationModal,
      props: {},
    });
  };

  const setEnabled = async (configuration: SupplierInvoicePeriodicConfiguration, enabled: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id: configuration.id,
        data: { enabled },
      });
      snackbar.success(enabled ? 'Periodicità abilitata' : 'Periodicità disabilitata');
    } catch {
      snackbar.error('Non è stato possibile aggiornare la periodicità');
    }
  };

  const deleteConfiguration = async (configuration: SupplierInvoicePeriodicConfiguration) => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina periodicità',
        text: 'La configurazione periodica verrà eliminata. Le fatture già generate resteranno disponibili.',
        alertSeverity: 'warning',
      },
    });

    if (result.action !== 'YES') return;

    try {
      await deleteMutation.mutateAsync(configuration.id);
      snackbar.success('Periodicità eliminata');
    } catch {
      snackbar.error('Non è stato possibile eliminare la periodicità');
    }
  };

  const renderRow = (configuration: SupplierInvoicePeriodicConfiguration) => {
    const periodUnit = PeriodUnitLabels[configuration.periodUnit] ?? configuration.periodUnit;

    return (
      <>
        <TableCell>
          <MainLabel>{configuration.supplier?.companyName ?? `#${configuration.supplierId}`}</MainLabel>
          <SecondaryLabel>
            {configuration.supplier?.vatNumber ?? configuration.supplier?.supplierCode ?? '-'}
          </SecondaryLabel>
        </TableCell>
        <TableCell align="right">
          <MainLabel>
            {configuration.useLastSupplierInvoiceAmount
              ? 'Ultima fattura'
              : formatCurrency(configuration.defaultAmount)}
          </MainLabel>
          {configuration.useLastSupplierInvoiceAmount ? (
            <SecondaryLabel>{formatCurrency(configuration.defaultAmount)}</SecondaryLabel>
          ) : null}
        </TableCell>
        <TableCell>
          <SecondaryLabel>{configuration.rowDescription || '-'}</SecondaryLabel>
        </TableCell>
        <TableCell>
          <MainLabel>
            Ogni {configuration.periodInterval} {periodUnit}
          </MainLabel>
        </TableCell>
        <TableCell>
          <MainLabel>{formatDate(configuration.startDate)}</MainLabel>
          <SecondaryLabel>
            {configuration.endDate ? `Fino al ${formatDate(configuration.endDate)}` : 'Senza fine'}
          </SecondaryLabel>
        </TableCell>
        <TableCell align="center">
          <Chip
            size="small"
            color={configuration.enabled ? 'success' : 'default'}
            label={configuration.enabled ? 'Si' : 'No'}
          />
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            <Tooltip title={configuration.enabled ? 'Disabilita' : 'Abilita'}>
              <Switch
                size="small"
                checked={configuration.enabled}
                onChange={(event) => setEnabled(configuration, event.target.checked)}
                disabled={updateMutation.isPending}
              />
            </Tooltip>
            <Tooltip title="Elimina">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteConfiguration(configuration)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </TableCell>
      </>
    );
  };

  return (
    <SplitLayout>
      <SplitMain ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Tooltip title="Torna alle fatture">
                <IconButton component={RouterLink} to={RouteConfig.SupplierInvoiceList.buildLink()}>
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Typography variant="h4">Periodicità Fornitori</Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => configurationsQuery.refetch()}
                disabled={configurationsQuery.isFetching}
              >
                Aggiorna
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateModal}
                sx={{ marginLeft: 'auto !important' }}
              >
                Nuova periodica
              </Button>
            </Stack>

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

            <DataTableContainer>
              <TableVirtuoso<SupplierInvoicePeriodicConfiguration>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                customScrollParent={scrollerRef.current || undefined}
                data={configurations}
                components={TableComponentsConfig}
                endReached={() => {
                  if (!configurationsQuery.hasNextPage || configurationsQuery.isFetching) return;
                  configurationsQuery.fetchNextPage();
                }}
                fixedHeaderContent={() => (
                  <TableHeading>
                    <PeriodicConfigurationBar
                      filters={filters}
                      onChange={updateFilter}
                      onReset={resetFilters}
                      resultCount={configurations.length}
                    />
                  </TableHeading>
                )}
                computeItemKey={(_index, configuration) => configuration.id}
                itemContent={(_index, configuration) => renderRow(configuration)}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
      </SplitMain>
    </SplitLayout>
  );
};

export default SupplierInvoicePeriodicConfigurationListView;
