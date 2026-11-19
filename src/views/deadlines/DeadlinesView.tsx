import { Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ListTabs from '~/components/Layout/ListTabs';
import PageContainer from '~/components/Layout/PageContainer';
import ExpiringComponentsTable from './components/ExpiringComponentsTable';
import PeriodicChecksTable from './components/PeriodicChecksTable';

const PERIODIC_CHECKS_TAB = 'periodic-checks';
const COMPONENTS_TAB = 'components';

/**
 * "Scadenze" (Operatività): the periodic checks of the year and the system components expiring, the deadlines of the
 * systems that the Delphi app showed in the ticket list ("controlli") and in the customer pending summary.
 * The tab is in the query string (?tab=components) so it can be linked.
 */
const DeadlinesView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === COMPONENTS_TAB ? COMPONENTS_TAB : PERIODIC_CHECKS_TAB;

  return (
    <PageContainer>
      <Stack spacing={3}>
        <ListTabs
          tabs={[
            { key: PERIODIC_CHECKS_TAB, label: 'Controlli periodici' },
            { key: COMPONENTS_TAB, label: 'Materiali in scadenza' },
          ]}
          selectedTabKey={tab}
          onSelect={(selected) =>
            setSearchParams(selected.key === COMPONENTS_TAB ? { tab: COMPONENTS_TAB } : {}, { replace: true })
          }
        />
        {tab === COMPONENTS_TAB ? <ExpiringComponentsTable /> : <PeriodicChecksTable />}
      </Stack>
    </PageContainer>
  );
};

export default DeadlinesView;
