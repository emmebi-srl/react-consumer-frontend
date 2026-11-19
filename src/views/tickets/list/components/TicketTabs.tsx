import { Add, FileDownload, Refresh } from '@mui/icons-material';
import { Button, Chip, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY, OPEN_TAB_KEY } from '~/components/Layout/ListTabs';
import { useModal } from '~/modals/Modal';
import { useTicketWorkload } from '~/proxies/aries-proxy/tickets';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesModule } from '~/types/aries-proxy/users';
import { formatWorkHours } from '../../ticketHelpers';
import { EXPIRED_TAB_KEY, useFilterState, useSetFilterState } from '../state';
import TicketExpiringExportModal from './TicketExpiringExportModal';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Tutti / Aperti / Scaduti (open statuses of `ticket/status`) + "ore da svolgere" and page actions ("In scadenza"
 * export, new ticket). The periodic checks of the Delphi list are in the "Scadenze" page.
 */
const TicketTabs: React.FC<Props> = ({ onRefresh, refreshing }) => {
  const filters = useFilterState();
  const setFilters = useSetFilterState();
  const modal = useModal();
  const { permission } = useModulePermission(AriesModule.Tickets);
  const { data: workload } = useTicketWorkload();

  const selectedTabKey = filters.expired ? EXPIRED_TAB_KEY : filters.open ? OPEN_TAB_KEY : ALL_TAB_KEY;

  return (
    <ListTabs
      tabs={[
        { key: ALL_TAB_KEY, label: 'Tutti' },
        { key: OPEN_TAB_KEY, label: 'Aperti' },
        { key: EXPIRED_TAB_KEY, label: 'Scaduti' },
      ]}
      selectedTabKey={selectedTabKey}
      onSelect={(tab) =>
        setFilters((current) => ({
          ...current,
          open: tab.key === OPEN_TAB_KEY ? true : undefined,
          expired: tab.key === EXPIRED_TAB_KEY ? true : undefined,
        }))
      }
      actions={
        <>
          {workload ? (
            <Tooltip title="Somma del tempo dei ticket aperti">
              <Chip variant="outlined" label={`Ore da svolgere: ${formatWorkHours(workload.openWorkMinutes)}`} />
            </Tooltip>
          ) : null}
          <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={refreshing}>
            Aggiorna
          </Button>
          {permission?.canPrint ? (
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => void modal.showModal({ component: TicketExpiringExportModal, props: {} })}
            >
              In scadenza
            </Button>
          ) : null}
          {permission?.canInsert ? (
            <Button
              component={RouterLink}
              to={RouteConfig.TicketNew.buildLink()}
              variant="contained"
              startIcon={<Add />}
            >
              Nuovo ticket
            </Button>
          ) : null}
        </>
      }
    />
  );
};

export default TicketTabs;
