import { RefObject, useLayoutEffect } from 'react';

/** Matches a cell whose whole text is a date (dd/MM/yyyy, optionally followed by a time). */
const DATE_ONLY_REGEX = /^\d{1,2}\/\d{1,2}\/\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/;
/** Header labels that identify a date column. */
const DATE_LABEL_REGEX = /^(data|date|scadenza|del)\b/i;

const getHeaderLabels = (table: HTMLTableElement): string[] => {
  const head = table.tHead;
  if (!head || head.rows.length === 0) return [];

  const labelsRow =
    head.querySelector<HTMLTableRowElement>('tr[data-table-labels]') ?? head.rows.item(head.rows.length - 1);
  if (!labelsRow) return [];

  const labels: string[] = [];
  Array.from(labelsRow.cells).forEach((cell) => {
    const text = cell.textContent.trim();
    for (let i = 0; i < (cell.colSpan || 1); i++) labels.push(text);
  });
  return labels;
};

const decorateRow = (row: HTMLTableRowElement, labels: string[]) => {
  let columnIndex = 0;
  let dateAssigned = false;

  Array.from(row.cells).forEach((cell) => {
    const label = labels[columnIndex] ?? '';
    columnIndex += cell.colSpan || 1;

    if (cell.dataset.label !== label) {
      if (label) cell.dataset.label = label;
      else delete cell.dataset.label;
    }

    const text = cell.textContent.trim();
    const isDate =
      !dateAssigned &&
      (DATE_ONLY_REGEX.test(text) || (!!text && text.length <= 20 && DATE_LABEL_REGEX.test(label) && /\d/.test(text)));
    if (isDate) {
      dateAssigned = true;
      cell.dataset.cardDate = '';
    } else if (cell.dataset.cardDate !== undefined) {
      delete cell.dataset.cardDate;
    }
  });
};

/**
 * On card layout, copies each column header text onto the body cells (`data-label`) so CSS can show it,
 * and marks the first date cell of each row (`data-card-date`) so it can be pinned to the top-right corner.
 * Works with virtualized tables: newly rendered rows are decorated through a MutationObserver.
 */
const useResponsiveCardCells = (tableRef: RefObject<HTMLTableElement | null>, enabled: boolean) => {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!enabled || !table) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const labels = getHeaderLabels(table);
      Array.from(table.tBodies).forEach((body) => Array.from(body.rows).forEach((row) => decorateRow(row, labels)));
    };

    apply();

    // Only childList/characterData are observed: the attributes we write never retrigger the observer.
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(apply);
    });
    observer.observe(table, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tableRef, enabled]);
};

export default useResponsiveCardCells;
