import { Add, Refresh, Settings } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY, OPEN_TAB_KEY } from '~/components/Layout/ListTabs';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesModule } from '~/types/aries-proxy/users';
import { useFilterState, useUpdateFilter } from '../state';

const INVOICES_TAB_KEY = 'invoices';
const PREINVOICES_TAB_KEY = 'preinvoices';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Fatture / Da incassare (INVOICE_OPEN_STATUS_IDS) / Prefatture / Tutte. The Delphi list shows the invoices and adds
 * the preinvoices with a checkbox: here they have their own tab.
 */
const InvoiceTabs: React.FC<Props> = ({ onRefresh, refreshing }) => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();
  const { permission } = useModulePermission(AriesModule.Invoices);

  const selected = filters.open
    ? OPEN_TAB_KEY
    : filters.kind === 'invoice'
      ? INVOICES_TAB_KEY
      : filters.kind === 'preinvoice'
        ? PREINVOICES_TAB_KEY
        : ALL_TAB_KEY;

  return (
    <ListTabs
      tabs={[
        { key: INVOICES_TAB_KEY, label: 'Fatture' },
        { key: OPEN_TAB_KEY, label: 'Da incassare' },
        { key: PREINVOICES_TAB_KEY, label: 'Prefatture' },
        { key: ALL_TAB_KEY, label: 'Tutte' },
      ]}
      selectedTabKey={selected}
      onSelect={(tab) => {
        updateFilter('open', tab.key === OPEN_TAB_KEY ? true : undefined);
        updateFilter(
          'kind',
          tab.key === INVOICES_TAB_KEY ? 'invoice' : tab.key === PREINVOICES_TAB_KEY ? 'preinvoice' : undefined,
        );
      }}
      actions={
        <>
          <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={refreshing}>
            Aggiorna
          </Button>
          <Button component={RouterLink} to={RouteConfig.InvoiceSettings.buildLink()} startIcon={<Settings />}>
            Impostazioni
          </Button>
          {permission?.canInsert ? (
            <Button
              component={RouterLink}
              to={RouteConfig.InvoiceNew.buildLink()}
              variant="contained"
              startIcon={<Add />}
            >
              Nuova fattura
            </Button>
          ) : null}
        </>
      }
    />
  );
};

export default InvoiceTabs;
