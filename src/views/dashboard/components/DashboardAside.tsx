import SplitAside from '~/components/Layout/SplitAside';
import MonthlyStatsAsideContent from './MonthlyStatsAsideContent';
import MonthlyCashflowAsideContent from './MonthlyCashflowAsideContent';
import MonthlyInvoicesAsideContent from './MonthlyInvoicesAsideContent';
import { useDashboardAsideItem } from '../state';

const DashboardAside = () => {
  const [asideItem, setAsideItem] = useDashboardAsideItem();

  return (
    <SplitAside open={Boolean(asideItem)} onClose={() => setAsideItem(undefined)} width={600}>
      {asideItem?.type === 'monthly-stats' ? (
        <MonthlyStatsAsideContent item={asideItem} />
      ) : asideItem?.type === 'monthly-cashflow' ? (
        <MonthlyCashflowAsideContent item={asideItem} />
      ) : asideItem?.type === 'monthly-invoices' ? (
        <MonthlyInvoicesAsideContent item={asideItem} />
      ) : null}
    </SplitAside>
  );
};
export default DashboardAside;
