import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { useDebounce } from 'use-debounce';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  TableCell,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useExpiringSystemComponents } from '~/proxies/aries-proxy/systems';
import { RouteConfig } from '~/routes/routeConfig';
import { getDateByUnixtimestamp, getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

const toInput = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * Installed system components (not disused) expiring in a period, e.g. batteries: the "Materiali in scadenza" of the
 * Delphi customer pending summary, for every customer. Read-only: they are replaced with the reports.
 */
const ExpiringComponentsTable: React.FC = () => {
  const today = toInput(new Date());
  const [toDate, setToDate] = useState(toInput(addDays(new Date(), 90)));
  const [includeExpired, setIncludeExpired] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const query = useExpiringSystemComponents({
    fromDate: includeExpired ? undefined : today,
    toDate,
    search: search || undefined,
  });
  const components = query.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          size="small"
          type="date"
          label="In scadenza entro il"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 190 }}
        />
        <TextField
          size="small"
          label="Cerca cliente, impianto o articolo"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          sx={{ maxWidth: 360, flexGrow: 1 }}
        />
        <FormControlLabel
          control={<Switch checked={includeExpired} onChange={(event) => setIncludeExpired(event.target.checked)} />}
          label="Includi già scaduti"
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {query.isFetching ? <CircularProgress size={14} /> : `${components.length} righe`}
        </Typography>
      </Stack>

      {query.isError ? <Alert severity="error">Non sono riuscito a caricare i materiali in scadenza.</Alert> : null}

      <DataTableContainer>
        <DataTable>
          <DataTableHead>
            <DataTableHeading
              order="asc"
              orderBy="date"
              headLabel={[
                { id: 'id', label: 'Imp.', align: 'right' },
                { id: 'customer', label: 'Cliente', align: 'left' },
                { id: 'date', label: 'Scadenza', align: 'left' },
                { id: 'system', label: 'Impianto', align: 'left' },
                { id: 'product', label: 'Articolo', align: 'left' },
                { id: 'quantity', label: 'Q.tà', align: 'right' },
                { id: 'installed', label: 'Installato il', align: 'left' },
              ]}
              numSelected={0}
              rowCount={0}
              onRequestSort={() => {}}
              onSelectAllClick={() => {}}
              select={false}
            />
          </DataTableHead>
          <DataTableBody>
            {components.map((component) => {
              const expired =
                !!component.expirationDate &&
                toInput(getDateByUnixtimestamp({ unixTimestamp: component.expirationDate })) < today;
              return (
                <DataTableRow key={`${component.systemId}-${component.productCode}-${component.expirationDate ?? ''}`}>
                  <TableCell align="right" width={80}>
                    <MainLabel>{component.systemId}</MainLabel>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0, minWidth: 200 }}>
                    {component.customerId ? (
                      <Link
                        component={RouterLink}
                        to={RouteConfig.CustomerDetail.buildLink({ customerId: String(component.customerId) })}
                        underline="hover"
                      >
                        <MainLabel title={component.customerName ?? undefined}>
                          {component.customerName ?? '-'}
                        </MainLabel>
                      </Link>
                    ) : (
                      <MainLabel>-</MainLabel>
                    )}
                  </TableCell>
                  <TableCell width={120}>
                    <MainLabel sx={expired ? { color: 'error.main', fontWeight: 600 } : undefined}>
                      {component.expirationDate ? getStringDateByUnixtimestamp(component.expirationDate) : '-'}
                    </MainLabel>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0, minWidth: 180 }}>
                    <SecondaryLabel title={component.systemDescription ?? undefined}>
                      {component.systemDescription ?? `Impianto ${component.systemId}`}
                    </SecondaryLabel>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0, minWidth: 220 }}>
                    <MainLabel title={component.productDescription ?? undefined}>
                      {component.productDescription ?? component.productCode}
                    </MainLabel>
                    <SecondaryLabel>
                      {[component.productCode, component.productBrand].filter(Boolean).join(' · ')}
                    </SecondaryLabel>
                  </TableCell>
                  <TableCell align="right" width={70}>
                    <MainLabel>{component.quantity}</MainLabel>
                  </TableCell>
                  <TableCell width={120}>
                    {component.installationDate ? (
                      <SecondaryLabel>{getStringDateByUnixtimestamp(component.installationDate)}</SecondaryLabel>
                    ) : (
                      <Chip size="small" variant="outlined" label="-" />
                    )}
                  </TableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
        {!query.isLoading && !components.length ? (
          <Box sx={{ p: 3, color: 'text.secondary' }}>
            <Typography variant="body2">Nessun materiale in scadenza nel periodo.</Typography>
          </Box>
        ) : null}
      </DataTableContainer>
    </Stack>
  );
};

export default ExpiringComponentsTable;
