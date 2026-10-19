import { ReactNode, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Control, Controller, FieldNamesMarkedBoolean, UseFormSetValue, useWatch } from 'react-hook-form';
import { format } from 'date-fns';
import {
  useBrands,
  useMeasurementUnits,
  useProductCategories,
  useProductStatuses,
  useProductSubcategories,
  useProductSubcategoriesLevel2,
  useProductionCostTypes,
} from '~/proxies/aries-proxy/products';
import { useSuppliersSearch } from '~/proxies/aries-proxy/suppliers';
import { Product } from '~/types/aries-proxy/products';
import { Supplier } from '~/types/aries-proxy/suppliers';
import { normalizeToHexColor } from '~/utils/color-utils';
import { ProductFormValues } from './productFormValues';

const DIRTY_FIELD_SX = { '& .MuiInputBase-root': { backgroundColor: '#fff9c4' } };

type FieldName = Exclude<keyof ProductFormValues, 'supplierName'>;

interface FormTextFieldProps {
  control: Control<ProductFormValues>;
  name: FieldName;
  label: string;
  width: number;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<ProductFormValues>>>;
  numeric?: boolean;
  decimal?: boolean;
  requiredMessage?: string;
  select?: boolean;
  multiline?: boolean;
  disabled?: boolean;
  endAdornment?: ReactNode;
  onValueChange?: () => void;
  children?: ReactNode;
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  control,
  name,
  label,
  width,
  dirtyFields,
  numeric,
  decimal,
  requiredMessage,
  select,
  multiline,
  disabled,
  endAdornment,
  onValueChange,
  children,
}) => (
  <Controller
    name={name}
    control={control}
    rules={requiredMessage ? { validate: (value) => String(value).trim() !== '' || requiredMessage } : undefined}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        select={select}
        multiline={multiline}
        disabled={disabled}
        minRows={multiline ? 6 : undefined}
        type={numeric && !select ? 'number' : undefined}
        label={label}
        size="small"
        required={!!requiredMessage}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        slotProps={{
          htmlInput: numeric && decimal ? { step: '0.01' } : undefined,
          input: endAdornment ? { endAdornment } : undefined,
        }}
        sx={{ minWidth: width, flex: `1 1 ${width}px`, ...(dirtyFields[name] ? DIRTY_FIELD_SX : {}) }}
        onChange={(e) => {
          field.onChange(numeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value);
          onValueChange?.();
        }}
      >
        {children}
      </TextField>
    )}
  />
);

const ReadOnlyField: React.FC<{ label: string; value: string; width: number }> = ({ label, value, width }) => (
  <TextField label={label} value={value} size="small" disabled sx={{ minWidth: width, flex: `1 1 ${width}px` }} />
);

const formatDate = (seconds?: number | null) => (seconds ? format(new Date(seconds * 1000), 'dd/MM/yyyy') : '');

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardHeader title={title} slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }} />
    <CardContent sx={{ pt: 0 }}>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
        {children}
      </Stack>
    </CardContent>
  </Card>
);

interface SupplierFieldProps {
  control: Control<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  highlighted: boolean;
}

const SupplierField: React.FC<SupplierFieldProps> = ({ control, setValue, highlighted }) => {
  const [searchText, setSearchText] = useState('');
  const suppliersQuery = useSuppliersSearch(searchText);
  const supplierId = useWatch({ control, name: 'supplierId' });
  const supplierName = useWatch({ control, name: 'supplierName' });
  const selected = supplierId === '' ? null : ({ id: supplierId, companyName: supplierName } as Supplier);

  return (
    <Autocomplete
      options={suppliersQuery.data ?? []}
      value={selected}
      loading={suppliersQuery.isLoading}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.companyName ?? String(option.id)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_event, value) => {
        setValue('supplierId', value?.id ?? '', { shouldDirty: true });
        setValue('supplierName', value?.companyName ?? '');
      }}
      onInputChange={(_event, value, reason) => {
        if (reason === 'input') setSearchText(value);
      }}
      sx={{ minWidth: 260, flex: '1 1 260px', ...(highlighted ? DIRTY_FIELD_SX : {}) }}
      renderInput={(params) => <TextField {...params} size="small" label="Fornitore privilegiato" />}
    />
  );
};

interface Props {
  // Undefined when creating a new product.
  product?: Product;
  control: Control<ProductFormValues>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<ProductFormValues>>>;
  setValue: UseFormSetValue<ProductFormValues>;
}

const ProductFormFields: React.FC<Props> = ({ product, control, dirtyFields, setValue }) => {
  const categoryId = useWatch({ control, name: 'categoryId' });
  const subcategoryId = useWatch({ control, name: 'subcategoryId' });
  const brandCode = useWatch({ control, name: 'brandCode' });
  const color = useWatch({ control, name: 'color' });

  const { data: statuses } = useProductStatuses();
  const { data: brandData } = useBrands();
  const { data: categoryData } = useProductCategories();
  const { data: subcategoryData } = useProductSubcategories(categoryId === '' ? undefined : categoryId);
  const { data: level2Data } = useProductSubcategoriesLevel2(subcategoryId === '' ? undefined : subcategoryId);
  const { data: measurementUnitData } = useMeasurementUnits();
  const { data: costTypeData } = useProductionCostTypes();

  const brands = brandData?.brands ?? [];
  const selectedBrand = brands.find((brand) => brand.id === brandCode) ?? null;
  const colorHex = normalizeToHexColor(color);
  const common = { control, dirtyFields };

  return (
    <Stack spacing={2}>
      <Section title="Articolo">
        {product ? (
          <ReadOnlyField label="Codice prodotto" value={product.productCode} width={160} />
        ) : (
          <FormTextField {...common} name="productCode" label="Codice (vuoto = automatico)" width={200} />
        )}
        <FormTextField {...common} name="description" label="Descrizione" width={360} requiredMessage="Obbligatoria" />
        <FormTextField {...common} name="barcode" label="Barcode" width={200} />
        <FormTextField {...common} name="supplierProductCode" label="Codice fornitore" width={180} />
        <Autocomplete
          options={brands}
          value={selectedBrand}
          getOptionLabel={(option) => option.name ?? option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, value) => setValue('brandCode', value?.id ?? '', { shouldDirty: true })}
          sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.brandCode ? DIRTY_FIELD_SX : {}) }}
          renderInput={(params) => <TextField {...params} size="small" label="Marca" />}
        />
        <FormTextField
          {...common}
          name="status"
          label="Stato"
          width={160}
          numeric
          select
          requiredMessage="Obbligatorio"
        >
          {(statuses ?? []).map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.name}
            </MenuItem>
          ))}
        </FormTextField>
        <FormTextField {...common} name="productionCostTypeId" label="Costo di produzione" width={200} numeric select>
          <MenuItem value="">Nessuno</MenuItem>
          {(costTypeData?.productionCostTypes ?? []).map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </FormTextField>
        {product && (
          <>
            <ReadOnlyField label="Data inserimento" value={formatDate(product.insertionDate)} width={140} />
            <ReadOnlyField label="Data modifica" value={formatDate(product.modificationDate)} width={140} />
            <FormControlLabel
              disabled
              control={<Checkbox checked={!!product.isKit} />}
              label="Articolo composto"
              sx={{ flex: '0 0 auto' }}
            />
          </>
        )}
      </Section>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
        <Section title="Categoria">
          <FormTextField
            {...common}
            name="categoryId"
            label="Categoria merceologica"
            width={220}
            numeric
            select
            requiredMessage="Obbligatoria"
            onValueChange={() => {
              setValue('subcategoryId', '', { shouldDirty: true });
              setValue('subcategoryLevel2Id', '', { shouldDirty: true });
            }}
          >
            {(categoryData?.categories ?? []).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            {...common}
            name="subcategoryId"
            label="Sottocategoria"
            width={200}
            numeric
            select
            onValueChange={() => setValue('subcategoryLevel2Id', '', { shouldDirty: true })}
          >
            <MenuItem value="">Nessuna</MenuItem>
            {(subcategoryData?.subcategories ?? []).map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            {...common}
            name="subcategoryLevel2Id"
            label="Sottocategoria 2° livello"
            width={200}
            numeric
            select
          >
            <MenuItem value="">Nessuna</MenuItem>
            {(level2Data?.subcategories ?? []).map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </FormTextField>
        </Section>

        <Section title="Info magazzino">
          <FormTextField {...common} name="depotPositionDescription" label="Posizione" width={240} />
          <FormTextField {...common} name="depotShelf" label="Scaffale" width={120} />
          <FormTextField {...common} name="depotShelfTier" label="Ripiano" width={120} />
        </Section>

        <Section title="Caratteristiche">
          <FormTextField {...common} name="height" label="H" width={90} numeric />
          <FormTextField {...common} name="width" label="L/ø" width={90} numeric />
          <FormTextField {...common} name="depth" label="P" width={90} numeric />
          <FormTextField {...common} name="minTemperature" label="T min" width={90} numeric />
          <FormTextField {...common} name="maxTemperature" label="T max" width={90} numeric />
          <FormTextField {...common} name="humidity" label="Umidità" width={90} numeric />
          <FormTextField {...common} name="weight" label="Peso" width={90} numeric decimal />
          <FormTextField {...common} name="liters" label="Litri" width={90} numeric />
          <FormTextField
            {...common}
            name="multiplier"
            label="Moltiplicatore"
            width={110}
            numeric
            decimal
            requiredMessage="Obbligatorio"
          />
          <FormTextField {...common} name="standbyAbsorption" label="Ass. riposo" width={110} numeric />
          <FormTextField {...common} name="activeAbsorption" label="Ass. attivo" width={110} numeric />
        </Section>

        <Section title="Altre caratteristiche">
          <FormTextField {...common} name="packageQuantity" label="Conf." width={90} numeric />
          <FormTextField {...common} name="expirationMonths" label="Scadenza (mesi)" width={120} numeric />
          <FormTextField {...common} name="warrantyMonths" label="Garanzia forn. (mesi)" width={140} numeric />
          <FormTextField
            {...common}
            name="installationTime"
            label="T. installazione"
            width={120}
            numeric
            disabled={!!product?.isKit}
          />
          <FormTextField {...common} name="maintenanceMinutes" label="T. manutenzione" width={120} numeric />
          <FormTextField {...common} name="measurementUnits" label="U.M." width={110} select>
            <MenuItem value="">Nessuna</MenuItem>
            {(measurementUnitData?.measurementUnits ?? []).map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.id}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField {...common} name="minQuantity" label="Q. min" width={90} numeric />
          <FormTextField {...common} name="maxQuantity" label="Q. max" width={90} numeric />
          <FormTextField
            {...common}
            name="color"
            label="Colore"
            width={140}
            endAdornment={
              colorHex ? (
                <InputAdornment position="end">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 0.5,
                      bgcolor: colorHex,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  />
                </InputAdornment>
              ) : undefined
            }
          />
          <SupplierField control={control} setValue={setValue} highlighted={!!dirtyFields.supplierId} />
        </Section>
      </Box>

      <Section title="Descrizione estesa">
        <FormTextField {...common} name="extendedDescription" label="Descrizione estesa" width={400} multiline />
      </Section>
    </Stack>
  );
};

export default ProductFormFields;
