import { ReactNode, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Product } from '~/types/aries-proxy/products';
import { decodeRtf } from '~/utils/rtf-utils';
import { getPriceListEntryMargin, MarginMode } from '../../productHelpers';

const formatAmount = (value?: number | null) =>
  value == null ? '—' : value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PRICE_LIST_ENTRY_TYPE_LABEL = { internal: 'Interno', supplier: 'Fornitore', brand: 'Marca' } as const;

interface DetailCardProps {
  title: string;
  empty: boolean;
  emptyText: string;
  action?: ReactNode;
  children: ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, empty, emptyText, action, children }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardHeader
      title={title}
      action={action}
      slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }}
    />
    <CardContent sx={{ pt: 0 }}>
      {empty ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyText}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>{children}</Box>
      )}
    </CardContent>
  </Card>
);

interface Props {
  product: Product;
}

// Read-only detail grids of the Delphi product form (UFProducts). Editing them is phase 2.
const ProductDetailTables: React.FC<Props> = ({ product }) => {
  const [marginMode, setMarginMode] = useState<MarginMode>('discount');

  const codes = product.codes ?? [];
  const linkedRows = [
    ...(product.spareParts ?? []).map((row) => ({ kind: 'Ricambio', ...row })),
    ...(product.equipment ?? []).map((row) => ({ kind: 'Attrezzatura', ...row })),
  ];
  const operations = product.operations ?? [];
  const priceListEntries = product.priceListEntries ?? [];
  const notes = product.notes ?? [];
  const regulations = product.regulations ?? [];

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
      <Box sx={{ gridColumn: { lg: '1 / -1' } }}>
        <DetailCard
          title="Listino"
          empty={priceListEntries.length === 0}
          emptyText="Nessun prezzo registrato"
          action={
            <ToggleButtonGroup
              size="small"
              exclusive
              value={marginMode}
              onChange={(_event, value: MarginMode | null) => value && setMarginMode(value)}
            >
              <ToggleButton value="markup">Ricarico</ToggleButton>
              <ToggleButton value="discount">Sconto</ToggleButton>
            </ToggleButtonGroup>
          }
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Prezzo</TableCell>
                <TableCell align="right">%</TableCell>
                <TableCell align="right">Costo</TableCell>
                <TableCell align="right">Ultimo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceListEntries.map((entry, index) => (
                <TableRow key={`${entry.type}-${entry.priceListId ?? index}`}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{PRICE_LIST_ENTRY_TYPE_LABEL[entry.type]}</TableCell>
                  <TableCell align="right">{formatAmount(entry.price)}</TableCell>
                  <TableCell align="right">{formatAmount(getPriceListEntryMargin(entry, marginMode))}</TableCell>
                  <TableCell align="right">{formatAmount(entry.cost)}</TableCell>
                  <TableCell align="right">{formatAmount(entry.lastPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailCard>
      </Box>

      <DetailCard title="Altri codici" empty={codes.length === 0} emptyText="Nessun codice alternativo">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codice</TableCell>
              <TableCell>Ragione sociale</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={`${code.code}-${code.supplierId ?? ''}`}>
                <TableCell>{code.code}</TableCell>
                <TableCell>{code.supplier?.companyName ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard
        title="Ricambi / Attrezzature / Operazioni"
        empty={linkedRows.length === 0 && operations.length === 0}
        emptyText="Nessun ricambio, attrezzatura o operazione"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrizione</TableCell>
              <TableCell align="right">Q.tà</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linkedRows.map((row) => (
              <TableRow key={`${row.kind}-${row.code}`}>
                <TableCell>{row.kind}</TableCell>
                <TableCell>{row.supplierProductCode || row.code}</TableCell>
                <TableCell>{row.description || row.productDescription || '—'}</TableCell>
                <TableCell align="right">{row.quantity ?? '—'}</TableCell>
              </TableRow>
            ))}
            {operations.map((operation) => (
              <TableRow key={`Operazione-${operation.operationId}`}>
                <TableCell>Operazione</TableCell>
                <TableCell>{operation.name ?? operation.operationId}</TableCell>
                <TableCell>{operation.description || '—'}</TableCell>
                <TableCell align="right">—</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard title="Note" empty={notes.length === 0} emptyText="Nessuna nota">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrizione</TableCell>
              <TableCell>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.description}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{note.description}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-line' }}>{decodeRtf(note.note)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard title="Normative" empty={regulations.length === 0} emptyText="Nessuna normativa">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regulations.map((regulation) => (
              <TableRow key={regulation.id}>
                <TableCell>{regulation.name}</TableCell>
                <TableCell>{regulation.note || regulation.description || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>
    </Box>
  );
};

export default ProductDetailTables;
