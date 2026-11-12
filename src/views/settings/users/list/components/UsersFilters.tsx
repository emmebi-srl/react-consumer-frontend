import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import { useDirtyState, useFilterState, useIsDirty, useResetFilters, useUpdateFilter } from '../state';

const UsersFilters: React.FC = () => {
  const isDirty = useIsDirty();
  const filters = useFilterState();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();

  return (
    <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
      <PrimaryFilters dirtyState={dirtyState} additionalFilters={[]}>
        <InlineSearchFilter name="search" value={filters.search} onChange={updateFilter} sx={{ maxWidth: 410 }} />
      </PrimaryFilters>
      <AdditionalFilters></AdditionalFilters>
    </CollapsibleFilters>
  );
};

export default UsersFilters;
