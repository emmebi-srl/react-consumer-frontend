import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDebounce } from 'use-debounce';
import useSnackbar from '~/hooks/useSnackbar';
import { getProductByCode } from '~/proxies/aries-proxy/api/products';
import { useProductsAutocomplete, useSaveProductKitComponents } from '~/proxies/aries-proxy/products';
import { Product, ProductKitComponent } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

type EditableNumber = 'quantity' | 'cost' | 'price' | 'installationTime';

const formatAmount = (value: number) =>
  value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toRows = (product: Product): ProductKitComponent[] =>
  [...(product.kitComponents ?? [])].sort((a, b) => a.position - b.position);

const sameRows = (a: ProductKitComponent[], b: ProductKitComponent[]) =>
  a.length === b.length &&
  a.every((row, index) => {
    const other = b[index];
    return (
      !!other &&
      row.code === other.code &&
      row.quantity === other.quantity &&
      row.cost === other.cost &&
      row.price === other.price &&
      row.installationTime === other.installationTime
    );
  });

interface Props {
  product: Product;
}

// Kit composition editor (Delphi UFProductCompound). Saving recalculates the kit internal price (list 2),
// cost (list 1) and installation time as the sum of the components (backend ProductKitLogic).
const ProductKitCard: React.FC<Props> = ({ product }) => {
  const snackbar = useSnackbar();
  const saveMutation = useSaveProductKitComponents();
  const savedRows = useMemo(() => toRows(product), [product]);
  const [rows, setRows] = useState<ProductKitComponent[]>(savedRows);
  const [replaceDescription, setReplaceDescription] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 400);
  const productsQuery = useProductsAutocomplete(debouncedSearch);
  const [adding, setAdding] = useState(false);

  useEffect(() => setRows(savedRows), [savedRows]);

  const dirty = !sameRows(rows, savedRows) || replaceDescription;
  const totals = rows.reduce(
    (acc, row) => ({
      cost: acc.cost + row.cost * row.quantity,
      price: acc.price + row.price * row.quantity,
      installationTime: acc.installationTime + row.installationTime * row.quantity,
    }),
    { cost: 0, price: 0, installationTime: 0 },
  );

  const updateRow = (index: number, field: EditableNumber, value: string) =>
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value === '' ? 0 : Number(value) } : row,
      ),
    );

  const moveRow = (index: number, offset: number) =>
    setRows((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      if (row) next.splice(index + offset, 0, row);
      return next;
    });

  // Like the Delphi kit editor: a new component starts with quantity 1 and the internal cost / price /
  // installation time of the chosen product.
  const addComponent = async (selected: Product | null) => {
    if (!selected) return;
    if (rows.some((row) => row.code === selected.productCode)) {
      snackbar.warning('Articolo già presente nel kit');
      return;
    }
    setAdding(true);
    try {
      const detail =
        (await getProductByCode(selected.productCode, { includes: 'price_list_entries' })).data.products.at(0) ??
        selected;
      const internal = detail.priceListEntries?.find((entry) => entry.type === 'internal');
      setRows((current) => [
        ...current,
        {
          code: detail.productCode,
          description: detail.description,
          supplierProductCode: detail.supplierProductCode,
          measurementUnits: detail.measurementUnits,
          quantity: 1,
          cost: internal?.cost ?? 0,
          price: internal?.price ?? 0,
          installationTime: detail.installationTime,
          position: current.length + 1,
        },
      ]);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile leggere l'articolo"));
    } finally {
      setAdding(false);
      setSearchText('');
    }
  };

  const save = async () => {
    try {
      await saveMutation.mutateAsync({
        productCode: product.productCode,
        data: {
          components: rows.map((row) => ({
            code: row.code,
            quantity: row.quantity,
            price: row.price,
            cost: row.cost,
            installationTime: row.installationTime,
          })),
          replaceExtendedDescription: replaceDescription,
        },
      });
      setReplaceDescription(false);
      snackbar.success('Composizione salvata: prezzo, costo e tempo del kit ricalcolati');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare la composizione'));
    }
  };

  const numberCell = (index: number, field: EditableNumber, value: number) => (
    <TextField
      size="small"
      type="number"
      value={value}
      onChange={(e) => updateRow(index, field, e.target.value)}
      slotProps={{ htmlInput: { step: field === 'quantity' ? '1' : '0.01', style: { textAlign: 'right' } } }}
      sx={{ width: 96 }}
    />
  );

  return (
    // The card lives inside the product form: Enter in its inputs must not submit the product.
    <Card
      variant="outlined"
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.preventDefault();
      }}
    >
      <CardHeader
        title="Composizione kit"
        subheader="Il salvataggio ricalcola prezzo, costo interno e tempo di installazione del kit"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Autocomplete
            options={(productsQuery.data ?? []).filter((option) => option.productCode !== product.productCode)}
            value={null}
            inputValue={searchText}
            loading={productsQuery.isFetching || adding}
            disabled={adding}
            filterOptions={(options) => options}
            getOptionLabel={(option) => [option.productCode, option.description].filter(Boolean).join(' - ')}
            isOptionEqualToValue={(option, value) => option.productCode === value.productCode}
            onChange={(_event, value) => void addComponent(value)}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input') setSearchText(value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Aggiungi componente"
                helperText="Codice, descrizione o barcode (almeno 2 caratteri)"
              />
            )}
          />

          {rows.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nessun componente
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Codice</TableCell>
                    <TableCell>Descrizione</TableCell>
                    <TableCell>U.M.</TableCell>
                    <TableCell align="right">Q.tà</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Prezzo</TableCell>
                    <TableCell align="right">T. inst.</TableCell>
                    <TableCell align="right">Totale</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.code}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                      <TableCell>{row.description || row.supplierProductCode || '—'}</TableCell>
                      <TableCell>{row.measurementUnits ?? '—'}</TableCell>
                      <TableCell align="right">{numberCell(index, 'quantity', row.quantity)}</TableCell>
                      <TableCell align="right">{numberCell(index, 'cost', row.cost)}</TableCell>
                      <TableCell align="right">{numberCell(index, 'price', row.price)}</TableCell>
                      <TableCell align="right">{numberCell(index, 'installationTime', row.installationTime)}</TableCell>
                      <TableCell align="right">{formatAmount(row.price * row.quantity)}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" disabled={index === 0} onClick={() => moveRow(index, -1)}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" disabled={index === rows.length - 1} onClick={() => moveRow(index, 1)}>
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setRows((current) => current.filter((_row, rowIndex) => rowIndex !== index))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ fontWeight: 600 }}>
                      Totali kit
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatAmount(totals.cost)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatAmount(totals.price)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {Math.round(totals.installationTime)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableFooter>
              </Table>
            </Box>
          )}

          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={replaceDescription} onChange={(e) => setReplaceDescription(e.target.checked)} />
              }
              label="Sostituisci la descrizione estesa con la composizione"
            />
            <Stack direction="row" spacing={1}>
              <Button disabled={!dirty || saveMutation.isPending} onClick={() => setRows(savedRows)}>
                Annulla modifiche
              </Button>
              <Button variant="contained" disabled={!dirty || saveMutation.isPending} onClick={save}>
                {saveMutation.isPending ? 'Salvataggio…' : 'Salva composizione'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductKitCard;
