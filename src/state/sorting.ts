import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

export type SortingDirection = 'asc' | 'desc';

interface Sorting<F extends string> {
  sort: F;
  direction: SortingDirection;
}

export const createSortingAtom = <F extends string>(defaultSorting: Sorting<F>) => {
  const sorting = atomWithReset(defaultSorting);

  const writableSorting = atom(
    (get) => get(sorting),
    (get, set, field: F) => {
      const currentSorting = get(sorting);
      if (field === currentSorting.sort) {
        if (currentSorting.direction === 'asc') {
          set(sorting, { sort: currentSorting.sort, direction: 'desc' });
        } else {
          set(sorting, { sort: currentSorting.sort, direction: 'asc' });
        }
      } else {
        set(sorting, { sort: field, direction: currentSorting.direction });
      }
    },
  );

  return {
    writableSorting,
    sorting,
  };
};
