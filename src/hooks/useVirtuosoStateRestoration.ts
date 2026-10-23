import { useCallback, useRef, useState } from 'react';
import { StateSnapshot, TableVirtuosoHandle } from 'react-virtuoso';

// Kept outside React so the snapshot survives the list unmounting while a detail page is open.
const snapshots = new Map<string, StateSnapshot>();

/**
 * Restores scroll position and measured row sizes of a TableVirtuoso list when coming back to it.
 * `key` should identify the list and its filters; `hasData` tells whether rows are already available
 * (e.g. from the React Query cache) at mount, otherwise there is nothing to restore against.
 */
const useVirtuosoStateRestoration = (key: string, hasData: boolean) => {
  const ref = useRef<TableVirtuosoHandle>(null);
  const [restoreStateFrom] = useState(() => (hasData ? snapshots.get(key) : undefined));

  const isScrolling = useCallback(
    (scrolling: boolean) => {
      if (scrolling) return;
      ref.current?.getState((state) => snapshots.set(key, state));
    },
    [key],
  );

  return { ref, restoreStateFrom, isScrolling };
};

export default useVirtuosoStateRestoration;
