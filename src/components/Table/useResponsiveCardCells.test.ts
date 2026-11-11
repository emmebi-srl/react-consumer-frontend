import { describe, expect, it } from 'vitest';
import { decorateRow, getHeaderLabels } from './useResponsiveCardCells';

const buildTable = (head: string[], cells: string[]) => {
  const table = document.createElement('table');
  table.innerHTML = `
    <thead><tr><th colspan="${head.length}">filters</th></tr>
    <tr data-table-labels>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody><tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr></tbody>`;
  const row = table.tBodies.item(0)?.rows.item(0);
  if (!row) throw new Error('missing row');
  decorateRow(row, getHeaderLabels(table));
  return Array.from(row.cells).map((cell) => ({
    label: cell.dataset.label,
    role: cell.dataset.cardRole,
    wide: cell.dataset.cardWide !== undefined,
  }));
};

describe('useResponsiveCardCells', () => {
  it('reads labels from the labels row, not the filters row', () => {
    const cells = buildTable(['ID', 'Nome'], ['1', 'Mario']);
    expect(cells.map((c) => c.label)).toEqual(['ID', 'Nome']);
  });

  it('assigns id, title, menu and wide field roles on a customer row', () => {
    const cells = buildTable(
      ['ID', 'Ragione Sociale', 'P.', 'Indirizzo', 'Stato', ''],
      [
        '123',
        '<a href="/c/123">ACME S.r.l.</a>',
        'TV',
        'Via Roma 12345, Treviso Centro',
        '<div class="MuiChip-root">Attivo</div>',
        '<button aria-label="Azioni"><svg></svg></button>',
      ],
    );
    expect(cells.map((c) => c.role)).toEqual(['id', 'title', undefined, undefined, undefined, 'menu']);
    expect(cells[3]?.wide).toBe(true);
    expect(cells[2]?.wide).toBe(false);
  });

  it('skips status chips as title and pins the first date', () => {
    const cells = buildTable(
      ['Stato', 'Cliente', 'Data', 'Scadenza', 'Azioni'],
      ['<div class="MuiChip-root">Bozza</div>', 'Rossi', '12/11/2026', '30/11/2026', '<button>Apri</button>'],
    );
    expect(cells.map((c) => c.role)).toEqual([undefined, 'title', 'date', undefined, 'actions']);
  });
});

describe('useResponsiveCardCells (DDT-like row)', () => {
  it('reads "id + year" as id and never uses a date as title', () => {
    const cells = buildTable(
      ['N.', 'Stato', 'Data', 'Destinatario'],
      [
        '<p>123</p><p>2026</p>',
        '<div class="MuiChip-root"><span>Emesso</span></div>',
        '<p>05/11/2026</p>',
        '<p>Rossi Srl</p><p>Cliente</p>',
      ],
    );
    expect(cells.map((c) => c.role)).toEqual(['id', undefined, 'date', 'title']);
  });
});
