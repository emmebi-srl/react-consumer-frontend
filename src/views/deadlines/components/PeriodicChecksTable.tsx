import { useState } from 'react';
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
import { useSystemPeriodicChecks } from '~/proxies/aries-proxy/systems';
import { RouteConfig } from '~/routes/routeConfig';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

/**
 * Periodic checks of the year (impianto_abbonamenti_mesi), the rows the Delphi ticket list added with its "controlli"
 * checkbox. Read-only: they are executed with the reports.
 */
const PeriodicChecksTable: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [onlyPending, setOnlyPending] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const query = useSystemPeriodicChecks({ year, onlyPending, search: search || undefined });
  const checks = query.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          size="small"
          type="number"
          label="Anno"
          value={year}
          onChange={(event) => setYear(Number(event.target.value) || new Date().getFullYear())}
          sx={{ width: 120 }}
        />
        <TextField
          size="small"
          label="Cerca cliente o impianto"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          sx={{ maxWidth: 360, flexGrow: 1 }}
        />
        <FormControlLabel
          control={<Switch checked={onlyPending} onChange={(event) => setOnlyPending(event.target.checked)} />}
          label="Solo da eseguire"
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {query.isFetching ? <CircularProgress size={14} /> : `${checks.length} controlli`}
        </Typography>
      </Stack>

      {query.isError ? <Alert severity="error">Non sono riuscito a caricare i controlli periodici.</Alert> : null}

      <DataTableContainer>
        <DataTable>
          <DataTableHead>
            <DataTableHeading
              order="asc"
              orderBy="date"
              headLabel={[
                { id: 'id', label: 'ID', align: 'right' },
                { id: 'customer', label: 'Cliente', align: 'left' },
                { id: 'date', label: 'Data prevista', align: 'left' },
                { id: 'system', label: 'Impianto', align: 'left' },
                { id: 'subscription', label: 'Abbonamento', align: 'left' },
                { id: 'month', label: 'Mese', align: 'left' },
                { id: 'executed', label: 'Eseguito il', align: 'left' },
              ]}
              numSelected={0}
              rowCount={0}
              onRequestSort={() => {}}
              onSelectAllClick={() => {}}
              select={false}
            />
          </DataTableHead>
          <DataTableBody>
            {checks.map((check) => (
              <DataTableRow key={check.id}>
                <TableCell align="right" width={80}>
                  <MainLabel>{check.id}</MainLabel>
                </TableCell>
                <TableCell sx={{ maxWidth: 0, minWidth: 200 }}>
                  {check.customerId ? (
                    <Link
                      component={RouterLink}
                      to={RouteConfig.CustomerDetail.buildLink({ customerId: String(check.customerId) })}
                      underline="hover"
                    >
                      <MainLabel title={check.customerName ?? undefined}>{check.customerName ?? '-'}</MainLabel>
                    </Link>
                  ) : (
                    <MainLabel>-</MainLabel>
                  )}
                </TableCell>
                <TableCell width={120}>
                  <MainLabel>{check.expectedDate ? getStringDateByUnixtimestamp(check.expectedDate) : '-'}</MainLabel>
                </TableCell>
                <TableCell sx={{ maxWidth: 0, minWidth: 180 }}>
                  <SecondaryLabel title={check.systemDescription ?? undefined}>
                    {check.systemDescription ?? `Impianto ${check.systemId}`}
                  </SecondaryLabel>
                </TableCell>
                <TableCell sx={{ maxWidth: 0, minWidth: 140 }}>
                  <SecondaryLabel>{check.subscriptionName ?? '-'}</SecondaryLabel>
                </TableCell>
                <TableCell width={90}>
                  <SecondaryLabel>
                    {MONTHS[check.month - 1] ?? check.month} {check.year}
                  </SecondaryLabel>
                </TableCell>
                <TableCell width={120}>
                  {check.executedDate ? (
                    <Chip
                      size="small"
                      color="success"
                      variant="outlined"
                      label={getStringDateByUnixtimestamp(check.executedDate)}
                    />
                  ) : (
                    <Chip size="small" color="warning" variant="outlined" label="Da eseguire" />
                  )}
                </TableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
        {!query.isLoading && !checks.length ? (
          <Box sx={{ p: 3, color: 'text.secondary' }}>
            <Typography variant="body2">Nessun controllo periodico.</Typography>
          </Box>
        ) : null}
      </DataTableContainer>
    </Stack>
  );
};

export default PeriodicChecksTable;
