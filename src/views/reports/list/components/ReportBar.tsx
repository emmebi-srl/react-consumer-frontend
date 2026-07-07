import Metadata from '~/components/Table/Metadata';
import ReportFilters from './ReportFilters';
import { useReportsMetadata } from '~/proxies/aries-proxy/reports';
import { useFilterState } from '../state';

const ReportBar = () => {
  const filters = useFilterState();
  const metadataQuery = useReportsMetadata(filters);

  return (
    <>
      <ReportFilters />
      <Metadata
        filteredCount={metadataQuery.data?.metadata.filteredCount ?? 0}
        totalCount={metadataQuery.data?.metadata.totalCount ?? 0}
      />
    </>
  );
};

export default ReportBar;
