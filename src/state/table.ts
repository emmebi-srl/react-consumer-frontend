import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithReset, useResetAtom } from 'jotai/utils';
import _isEqual from 'lodash/isEqual';
import _toPairs from 'lodash/toPairs';
import _fromPairs from 'lodash/fromPairs';
import _differenceWith from 'lodash/differenceWith';
import { createSelection } from './selection';
import { createSortingAtom, SortingDirection } from '~/state/sorting';
import { omit } from 'lodash';

export const createTableState = <Filters extends object, SortingFields extends string>(
  defaultValues: Filters,
  defaultSorting: {
    sort: SortingFields;
    direction: SortingDirection;
  },
) => {
  const filtersAtom = atomWithReset<Filters>(defaultValues);
  const { writableSorting: writableSortingAtom, sorting: sortingAtom } =
    createSortingAtom<SortingFields>(defaultSorting);
  const {
    useActivate,
    useActiveId,
    useIsActive,
    useIsChecked,
    useIsSidebarOpen,
    useResetSelection,
    useSelect,
    useSelectAll,
    useSelection,
  } = createSelection();

  const isDirtyAtom = atom((get) => {
    const filters = get(filtersAtom);
    return !_isEqual(filters, defaultValues);
  });

  const dirtyStateAtom = atom((get) => {
    const filters = get(filtersAtom);
    return _fromPairs(_differenceWith(_toPairs(filters), _toPairs(defaultValues), _isEqual)) as Partial<Filters>;
  });

  const useResetFilters = () => {
    return useResetAtom(filtersAtom);
  };

  const fieldAtom = <K extends keyof Filters>(key: K) => {
    return atom(
      (get) => get(filtersAtom)[key],
      (get, set, newValue: Filters[K]) => {
        set(filtersAtom, { ...get(filtersAtom), [key]: newValue });
      },
    );
  };

  const useFilterState = () => useAtomValue(filtersAtom);
  const useSetFilterState = () => useSetAtom(filtersAtom);

  const useUpdateFilter = () => {
    const setFilters = useSetFilterState();
    const reset = useResetSelection();
    const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((filters) => ({ ...filters, [key]: value }));
      reset();
    };
    return update;
  };

  const useIsDirty = () => useAtomValue(isDirtyAtom);
  const useDirtyState = (ignoreKeys: string[] = []): Partial<Filters> => {
    const dirty = useAtomValue(dirtyStateAtom);
    return omit(dirty, ignoreKeys) as Partial<Filters>;
  };

  const useSorting = () => {
    return useAtom(writableSortingAtom);
  };

  const useSetSorting = () => {
    return useSetAtom(sortingAtom);
  };
  const useResetSorting = () => {
    return useResetAtom(sortingAtom);
  };

  return {
    fieldAtom,
    useActivate,
    useActiveId,
    useDirtyState,
    useIsActive,
    useFilterState,
    useSetFilterState,
    useIsChecked,
    useIsDirty,
    useIsSidebarOpen,
    useResetFilters,
    useResetSelection,
    useSelect,
    useSelectAll,
    useSelection,
    useSorting,
    useSetSorting,
    useResetSorting,
    useUpdateFilter,
  };
};
