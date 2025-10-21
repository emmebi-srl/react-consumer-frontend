import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

export const createSelection = () => {
  const activeIdAtom = atom<string | null>(null);
  const selectedAtom = atom<string[]>([]);
  const excludedAtom = atom<string[]>([]);
  const selectedAllAtom = atom<boolean>(false);

  const useSelection = () => {
    const [activeId] = useAtom(activeIdAtom);
    const [selected] = useAtom(selectedAtom);
    const [excluded] = useAtom(excludedAtom);
    const [selectedAll] = useAtom(selectedAllAtom);
    const hasSelection = selected.length > 0 || selectedAll;
    return { activeId, excluded, hasSelection, selected, selectedAll };
  };

  const selectAtom = atom(null, (get, set, id: string) => {
    const isSelected = get(selectedAtom).includes(id);
    const isExcluded = get(excludedAtom).includes(id);
    const selectedAll = get(selectedAllAtom);

    if (selectedAll) {
      if (isExcluded) {
        set(
          excludedAtom,
          get(excludedAtom).filter((excludedId) => excludedId !== id),
        );
      } else {
        set(excludedAtom, [...get(excludedAtom), id]);
      }
    } else {
      if (isSelected) {
        set(
          selectedAtom,
          get(selectedAtom).filter((selectedId) => selectedId !== id),
        );
      } else {
        set(selectedAtom, [...get(selectedAtom), id]);
      }
    }
    set(activeIdAtom, null);
  });

  const useSelect = () => useSetAtom(selectAtom);

  const isActiveAtom = atom((get) => {
    const isChecked = get(isCheckedAtom);
    return (id: string) => {
      const activeId = get(activeIdAtom);
      if (activeId === id) {
        return true;
      }

      return isChecked(id);
    };
  });

  const useIsActive = () => useAtomValue(isActiveAtom);

  const isCheckedAtom = atom((get) => {
    const selectedAll = get(selectedAllAtom);
    const selected = get(selectedAtom);
    const excluded = get(excludedAtom);

    return (id: string) => {
      if (selectedAll) {
        return !excluded.includes(id);
      } else {
        return selected.includes(id);
      }
    };
  });

  const useIsChecked = () => useAtomValue(isCheckedAtom);

  const isSidebarOpenAtom = atom((get) => {
    const activeId = get(activeIdAtom);
    const selected = get(selectedAtom);
    const selectedAll = get(selectedAllAtom);
    return !!activeId || selected.length > 0 || selectedAll;
  });

  const useIsSidebarOpen = () => useAtomValue(isSidebarOpenAtom);

  const selectAllAtom = atom(null, (get, set) => {
    const selectedAll = get(selectedAllAtom);
    set(selectedAllAtom, !selectedAll);
    set(selectedAtom, []);
    set(excludedAtom, []);
  });

  const useSelectAll = () => useSetAtom(selectAllAtom);

  const resetSelectionAtom = atom(null, (get, set) => {
    set(selectedAllAtom, false);
    set(selectedAtom, []);
    set(excludedAtom, []);
    set(activeIdAtom, null);
  });

  const useResetSelection = () => useSetAtom(resetSelectionAtom);

  const activateAtom = atom(null, (get, set, id: string) => {
    if (id === get(activeIdAtom)) {
      set(activeIdAtom, null);
    } else {
      set(activeIdAtom, id);
    }
    set(selectedAllAtom, false);
    set(selectedAtom, []);
    set(excludedAtom, []);
  });
  const useActiveId = () => useAtomValue(activeIdAtom);
  const useActivate = () => useSetAtom(activateAtom);

  return {
    useActivate,
    useActiveId,
    useIsActive,
    useIsChecked,
    useIsSidebarOpen,
    useResetSelection,
    useSelect,
    useSelectAll,
    useSelection,
  };
};
