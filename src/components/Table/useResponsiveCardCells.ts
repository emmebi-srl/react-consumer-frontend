import { RefObject, useLayoutEffect } from 'react';

/**
 * Role of a body cell in the card layout (written to `data-card-role`):
 * - `select`: unlabeled selection checkbox, pinned top-left
 * - `id`: numeric identifier, shown as a small "#123" eyebrow above the title
 * - `title`: first meaningful cell, the card heading
 * - `date`: first date of the row, pinned top-right
 * - `menu`: icon-only actions (e.g. kebab menu), pinned top-right
 * - `actions`: actions with text (buttons), full-width footer
 * Cells without a role are fields; long ones get `data-card-wide` and span the whole card.
 */
export type CardCellRole = 'select' | 'id' | 'title' | 'date' | 'menu' | 'actions';

/** Matches a cell whose whole text is a date (dd/MM/yyyy, optionally followed by a time). */
const DATE_ONLY_REGEX = /^\d{1,2}\/\d{1,2}\/\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/;
/** Header labels that identify a date column. */
const DATE_LABEL_REGEX = /^(data|date|scadenza|del)\b/i;
const ID_TEXT_REGEX = /^#?\d+$/;
const ID_LABEL_REGEX = /^(id|#|n\.?|n°|nr\.?|num\.?|numero|cod\.?|codice)$/i;
const ACTIONS_LABEL_REGEX = /^(azion[ei]|actions?)?$/i;
const WIDE_TEXT_LENGTH = 24;

export const getHeaderLabels = (table: HTMLTableElement): string[] => {
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

const setData = (cell: HTMLTableCellElement, key: string, value: string | undefined) => {
  if (value === undefined) {
    if (key in cell.dataset) delete cell.dataset[key];
  } else if (cell.dataset[key] !== value) {
    cell.dataset[key] = value;
  }
};

const isInteractive = (cell: HTMLTableCellElement) => !!cell.querySelector('button, a[href], [role="button"]');

/** A status chip or a checkbox alone makes a poor card heading. */
const isTitleCandidate = (cell: HTMLTableCellElement, text: string) => {
  if (!text || cell.querySelector('input[type="checkbox"]')) return false;
  const chip = cell.querySelector('.MuiChip-root');
  return chip?.textContent.trim() !== text;
};

export const decorateRow = (row: HTMLTableRowElement, labels: string[]) => {
  let columnIndex = 0;
  const assigned = new Set<CardCellRole>();

  Array.from(row.cells).forEach((cell, cellIndex) => {
    const label = labels[columnIndex] ?? '';
    columnIndex += cell.colSpan || 1;
    const text = cell.textContent.trim();

    const pickRole = (): CardCellRole | undefined => {
      if (!label && !text && cell.querySelector('input[type="checkbox"]')) return 'select';
      if (ACTIONS_LABEL_REGEX.test(label) && isInteractive(cell)) return text ? 'actions' : 'menu';
      if (!assigned.has('id') && !assigned.has('title') && ID_TEXT_REGEX.test(text)) {
        if (cellIndex === 0 || ID_LABEL_REGEX.test(label)) return 'id';
      }
      if (!assigned.has('title') && isTitleCandidate(cell, text)) return 'title';
      const isDate =
        DATE_ONLY_REGEX.test(text) || (text.length <= 20 && DATE_LABEL_REGEX.test(label) && /\d/.test(text));
      if (!assigned.has('date') && isDate) return 'date';
      return undefined;
    };

    const role = pickRole();
    if (role) assigned.add(role);

    setData(cell, 'label', label || undefined);
    setData(cell, 'cardRole', role);
    setData(cell, 'cardWide', !role && text.length > WIDE_TEXT_LENGTH ? '' : undefined);
  });
};

/**
 * On card layout, copies each column header text onto the body cells (`data-label`) and assigns each cell
 * a role (`data-card-role`) so CSS can build a card with a heading, pinned date/menu and a grid of fields.
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
