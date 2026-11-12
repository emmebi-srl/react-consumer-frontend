import { Add, Refresh, Settings } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY, OPEN_TAB_KEY } from '~/components/Layout/ListTabs';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesModule } from '~/types/aries-proxy/users';
import { useFilterState, useUpdateFilter } from '../state';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/** Tutti / Aperti (`DDT_OPEN_STATUS_IDS`) + page actions. */
const DdtTabs: React.FC<Props> = ({ onRefresh, refreshing }) => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();
  const { permission } = useModulePermission(AriesModule.Ddts);

  return (
    <ListTabs
      tabs={[
        { key: ALL_TAB_KEY, label: 'Tutti' },
        { key: OPEN_TAB_KEY, label: 'Aperti' },
      ]}
      selectedTabKey={filters.open ? OPEN_TAB_KEY : ALL_TAB_KEY}
      onSelect={(tab) => updateFilter('open', tab.key === OPEN_TAB_KEY ? true : undefined)}
      actions={
        <>
          <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={refreshing}>
            Aggiorna
          </Button>
          {permission?.canEdit ? (
            <Button component={RouterLink} to={RouteConfig.DdtSettings.buildLink()} startIcon={<Settings />}>
              Tabelle DDT
            </Button>
          ) : null}
          {permission?.canInsert ? (
            <Button component={RouterLink} to={RouteConfig.DdtNew.buildLink()} variant="contained" startIcon={<Add />}>
              Nuovo DDT
            </Button>
          ) : null}
        </>
      }
    />
  );
};

export default DdtTabs;
