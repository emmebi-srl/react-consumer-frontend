import { Refresh } from '@mui/icons-material';
import { Button } from '@mui/material';
import ListTabs, { ALL_TAB_KEY, OPEN_TAB_KEY } from '~/components/Layout/ListTabs';
import { useFilterState, useUpdateFilter } from '../state';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/** Tutti / Aperti (`QUOTE_OPEN_STATUS_IDS`) + page actions. */
const QuoteTabs: React.FC<Props> = ({ onRefresh, refreshing }) => {
  const filters = useFilterState();
  const updateFilter = useUpdateFilter();

  return (
    <ListTabs
      tabs={[
        { key: ALL_TAB_KEY, label: 'Tutti' },
        { key: OPEN_TAB_KEY, label: 'Aperti' },
      ]}
      selectedTabKey={filters.open ? OPEN_TAB_KEY : ALL_TAB_KEY}
      onSelect={(tab) => updateFilter('open', tab.key === OPEN_TAB_KEY ? true : undefined)}
      actions={
        <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={refreshing}>
          Aggiorna
        </Button>
      }
    />
  );
};

export default QuoteTabs;
