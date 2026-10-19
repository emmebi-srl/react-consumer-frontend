import { ReactNode, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useModal } from '~/modals/Modal';
import {
  useDeleteProductCode,
  useDeleteProductLinkedProduct,
  useDeleteProductNote,
  useDeleteProductOperation,
  useDeleteProductRegulation,
} from '~/proxies/aries-proxy/products';
import { Product, ProductLinkedProduct, ProductLinkedProductKind } from '~/types/aries-proxy/products';
import { decodeRtf } from '~/utils/rtf-utils';
import { getPriceListEntryMargin, MarginMode } from '../../productHelpers';
import ProductCodeModal from './ProductCodeModal';
import ProductDetailRowActions from './ProductDetailRowActions';
import ProductLinkedProductModal from './ProductLinkedProductModal';
import ProductNoteModal from './ProductNoteModal';
import ProductOperationModal from './ProductOperationModal';
import ProductPriceModal from './ProductPriceModal';
import ProductRegulationAddModal from './ProductRegulationAddModal';

const formatAmount = (value?: number | null) =>
  value == null ? '—' : value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PRICE_LIST_ENTRY_TYPE_LABEL = { internal: 'Interno', supplier: 'Fornitore', brand: 'Marca' } as const;

const LINKED_KIND_LABEL: Record<ProductLinkedProductKind, string> = {
  'spare-parts': 'Ricambio',
  equipment: 'Attrezzatura',
};

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

const AddButton: React.FC<{ label?: string; onClick: (event: React.MouseEvent<HTMLElement>) => void }> = ({
  label = 'Aggiungi',
  onClick,
}) => (
  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onClick}>
    {label}
  </Button>
);

interface Props {
  product: Product;
}

// Detail grids of the Delphi product form (UFProducts).
const ProductDetailTables: React.FC<Props> = ({ product }) => {
  const productCode = product.productCode;
  const modal = useModal();
  const [marginMode, setMarginMode] = useState<MarginMode>('discount');
  const [linkedMenuAnchor, setLinkedMenuAnchor] = useState<HTMLElement | null>(null);

  const deleteCode = useDeleteProductCode();
  const deleteLinked = useDeleteProductLinkedProduct();
  const deleteOperation = useDeleteProductOperation();
  const deleteNote = useDeleteProductNote();
  const deleteRegulation = useDeleteProductRegulation();

  const codes = product.codes ?? [];
  const linkedRows: (ProductLinkedProduct & { kind: ProductLinkedProductKind })[] = [
    ...(product.spareParts ?? []).map((row) => ({ ...row, kind: 'spare-parts' as const })),
    ...(product.equipment ?? []).map((row) => ({ ...row, kind: 'equipment' as const })),
  ];
  const operations = product.operations ?? [];
  const priceListEntries = product.priceListEntries ?? [];
  const notes = product.notes ?? [];
  const regulations = product.regulations ?? [];

  const openLinkedModal = (kind: ProductLinkedProductKind, row?: ProductLinkedProduct) =>
    modal.showModal({ component: ProductLinkedProductModal, props: { productCode, kind, row } });

  const openOperationModal = (operation?: (typeof operations)[number]) =>
    modal.showModal({
      component: ProductOperationModal,
      props: { productCode, operation, linkedIds: operations.map((o) => o.operationId) },
    });

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
      <Box sx={{ gridColumn: { lg: '1 / -1' } }}>
        <DetailCard
          title="Listino"
          empty={priceListEntries.length === 0}
          emptyText="Nessun prezzo registrato"
          action={
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={marginMode}
                onChange={(_event, value: MarginMode | null) => value && setMarginMode(value)}
              >
                <ToggleButton value="markup">Ricarico</ToggleButton>
                <ToggleButton value="discount">Sconto</ToggleButton>
              </ToggleButtonGroup>
              <AddButton
                label="Aggiungi listino"
                onClick={() =>
                  modal.showModal({
                    component: ProductPriceModal,
                    props: { productCode, existingEntries: priceListEntries },
                  })
                }
              />
            </Stack>
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
                <TableCell align="right" />
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
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() =>
                        modal.showModal({
                          component: ProductPriceModal,
                          props: { productCode, entry, existingEntries: priceListEntries },
                        })
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailCard>
      </Box>

      <DetailCard
        title="Altri codici"
        empty={codes.length === 0}
        emptyText="Nessun codice alternativo"
        action={<AddButton onClick={() => modal.showModal({ component: ProductCodeModal, props: { productCode } })} />}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codice</TableCell>
              <TableCell>Ragione sociale</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={`${code.code}-${code.supplierId ?? ''}`}>
                <TableCell>{code.code}</TableCell>
                <TableCell>{code.supplier?.companyName ?? '—'}</TableCell>
                <TableCell align="right">
                  <ProductDetailRowActions
                    onEdit={() => modal.showModal({ component: ProductCodeModal, props: { productCode, code } })}
                    deleteTitle="Elimina codice"
                    deleteText={`Eliminare il codice "${code.code}"?`}
                    onDelete={() => deleteCode.mutateAsync({ productCode, code: code.code })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard
        title="Ricambi / Attrezzature / Operazioni"
        empty={linkedRows.length === 0 && operations.length === 0}
        emptyText="Nessun ricambio, attrezzatura o operazione"
        action={
          <>
            <AddButton onClick={(event) => setLinkedMenuAnchor(event.currentTarget)} />
            <Menu anchorEl={linkedMenuAnchor} open={!!linkedMenuAnchor} onClose={() => setLinkedMenuAnchor(null)}>
              <MenuItem
                onClick={() => {
                  setLinkedMenuAnchor(null);
                  void openLinkedModal('spare-parts');
                }}
              >
                Ricambio
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setLinkedMenuAnchor(null);
                  void openLinkedModal('equipment');
                }}
              >
                Attrezzatura
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setLinkedMenuAnchor(null);
                  void openOperationModal();
                }}
              >
                Operazione
              </MenuItem>
            </Menu>
          </>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrizione</TableCell>
              <TableCell align="right">Q.tà</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {linkedRows.map((row) => (
              <TableRow key={`${row.kind}-${row.code}`}>
                <TableCell>{LINKED_KIND_LABEL[row.kind]}</TableCell>
                <TableCell>{row.supplierProductCode || row.code}</TableCell>
                <TableCell>{row.description || row.productDescription || '—'}</TableCell>
                <TableCell align="right">{row.quantity ?? '—'}</TableCell>
                <TableCell align="right">
                  <ProductDetailRowActions
                    onEdit={() => openLinkedModal(row.kind, row)}
                    deleteTitle={`Elimina ${LINKED_KIND_LABEL[row.kind].toLowerCase()}`}
                    deleteText={`Scollegare l'articolo "${row.code}"?`}
                    onDelete={() => deleteLinked.mutateAsync({ productCode, kind: row.kind, code: row.code })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {operations.map((operation) => (
              <TableRow key={`operation-${operation.operationId}`}>
                <TableCell>Operazione</TableCell>
                <TableCell>{operation.name ?? operation.operationId}</TableCell>
                <TableCell>{operation.description || '—'}</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="right">
                  <ProductDetailRowActions
                    onEdit={() => openOperationModal(operation)}
                    deleteTitle="Elimina operazione"
                    deleteText={`Eliminare l'operazione "${operation.name ?? operation.operationId}"?`}
                    onDelete={() => deleteOperation.mutateAsync({ productCode, operationId: operation.operationId })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard
        title="Note"
        empty={notes.length === 0}
        emptyText="Nessuna nota"
        action={<AddButton onClick={() => modal.showModal({ component: ProductNoteModal, props: { productCode } })} />}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrizione</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.description}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{note.description}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-line' }}>{decodeRtf(note.note)}</TableCell>
                <TableCell align="right">
                  <ProductDetailRowActions
                    onEdit={() => modal.showModal({ component: ProductNoteModal, props: { productCode, note } })}
                    deleteTitle="Elimina nota"
                    deleteText={`Eliminare la nota "${note.description}"?`}
                    onDelete={() => deleteNote.mutateAsync({ productCode, description: note.description })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard
        title="Normative"
        empty={regulations.length === 0}
        emptyText="Nessuna normativa"
        action={
          <AddButton
            onClick={() =>
              modal.showModal({
                component: ProductRegulationAddModal,
                props: { productCode, linkedIds: regulations.map((regulation) => regulation.id) },
              })
            }
          />
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {regulations.map((regulation) => (
              <TableRow key={regulation.id}>
                <TableCell>{regulation.name}</TableCell>
                <TableCell>{regulation.note || regulation.description || '—'}</TableCell>
                <TableCell align="right">
                  <ProductDetailRowActions
                    deleteTitle="Rimuovi normativa"
                    deleteText={`Rimuovere la normativa "${regulation.name}" dall'articolo?`}
                    onDelete={() => deleteRegulation.mutateAsync({ productCode, regulationId: regulation.id })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>
    </Box>
  );
};

export default ProductDetailTables;
