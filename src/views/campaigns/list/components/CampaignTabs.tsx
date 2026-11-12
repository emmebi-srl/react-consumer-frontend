import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY } from '~/components/Layout/ListTabs';
import { StateTabData } from '~/components/Layout/NavigationTabs';
import { RouteConfig } from '~/routes/routeConfig';
import { useFilterState, useUpdateFilter } from '../state';

const Tabs: StateTabData[] = [
  { label: 'Tutte', key: ALL_TAB_KEY },
  { label: 'Attive', key: 'active' },
  { label: 'Non attive', key: 'inactive' },
];

const CampaignTabs: React.FC = () => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();

  const selectedTab = useMemo(() => {
    if (filters.active === true) return 'active';
    if (filters.active === false) return 'inactive';
    return ALL_TAB_KEY;
  }, [filters.active]);

  return (
    <ListTabs
      tabs={Tabs}
      selectedTabKey={selectedTab}
      onSelect={(tab) => {
        if (tab.key === 'active') updateFilter('active', true);
        else if (tab.key === 'inactive') updateFilter('active', false);
        else updateFilter('active', undefined);
      }}
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          component={Link}
          to={RouteConfig.CampaignNew.buildLink()}
        >
          Crea campagna
        </Button>
      }
    />
  );
};

export default CampaignTabs;
