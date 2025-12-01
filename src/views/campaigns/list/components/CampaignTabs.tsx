import { Add } from '@mui/icons-material';
import { Button, styled } from '@mui/material';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import NavigationTabs, { StateTabData } from '~/components/Layout/NavigationTabs';
import { useFilterState, useUpdateFilter } from '../state';
import { Link } from 'react-router-dom';
import { RouteConfig } from '~/routes/routeConfig';

const Container = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Tabs: StateTabData[] = [
  {
    label: 'Tutte',
    key: 'all',
  },
  {
    label: 'Attive',
    key: 'active',
  },
  {
    label: 'Non attive',
    key: 'inactive',
  },
];

const CampaignTabs: React.FC = () => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();

  const selectedTab = useMemo(() => {
    if (filters.active === true) return 'active';
    if (filters.active === false) return 'inactive';
    return 'all';
  }, [filters.active]);

  return (
    <Container>
      <NavigationTabs
        tabs={Tabs}
        selectedTabKey={selectedTab}
        onSelect={(tab) => {
          if (tab.key === 'all') {
            updateFilter('active', undefined);
          } else if (tab.key === 'active') {
            updateFilter('active', true);
          } else if (tab.key === 'inactive') {
            updateFilter('active', false);
          }
        }}
      />

      <Box display="flex" gap={1} alignItems="center">
        <Box display="flex" alignItems="flex-end" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            component={Link}
            to={RouteConfig.CampaignNew.buildLink()}
          >
            Crea campagna
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CampaignTabs;
