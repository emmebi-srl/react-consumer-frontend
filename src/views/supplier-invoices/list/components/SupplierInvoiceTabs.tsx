import { EventRepeat, Refresh } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY, OPEN_TAB_KEY } from '~/components/Layout/ListTabs';
import { RouteConfig } from '~/routes/routeConfig';
import { SUPPLIER_INVOICE_PRO_FORMA_STATUS_ID } from '~/types/aries-proxy/supplier-invoices';
import { useFilterState, useUpdateFilter } from '../state';

const PRO_FORMA_TAB_KEY = 'pro-forma';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Tutte / Aperte (`SUPPLIER_INVOICE_OPEN_STATUS_IDS`) / Prefatture + page actions.
 * "Prefatture" is just the pro-forma status, so the "Stato" filter can still pick any other status.
 */
const SupplierInvoiceTabs: React.FC<Props> = ({ onRefresh, refreshing }) => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();

  const selectedTabKey = filters.open
    ? OPEN_TAB_KEY
    : filters.statusId === SUPPLIER_INVOICE_PRO_FORMA_STATUS_ID
      ? PRO_FORMA_TAB_KEY
      : ALL_TAB_KEY;

  return (
    <ListTabs
      tabs={[
        { key: ALL_TAB_KEY, label: 'Tutte' },
        { key: OPEN_TAB_KEY, label: 'Aperte' },
        { key: PRO_FORMA_TAB_KEY, label: 'Prefatture' },
      ]}
      selectedTabKey={selectedTabKey}
      onSelect={(tab) => {
        updateFilter('open', tab.key === OPEN_TAB_KEY ? true : undefined);
        updateFilter('statusId', tab.key === PRO_FORMA_TAB_KEY ? SUPPLIER_INVOICE_PRO_FORMA_STATUS_ID : undefined);
      }}
      actions={
        <>
          <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={refreshing}>
            Aggiorna
          </Button>
          <Button
            variant="contained"
            startIcon={<EventRepeat />}
            component={RouterLink}
            to={RouteConfig.SupplierInvoicePeriodicConfigurationList.buildLink()}
          >
            Gestisci periodicità
          </Button>
        </>
      }
    />
  );
};

export default SupplierInvoiceTabs;
