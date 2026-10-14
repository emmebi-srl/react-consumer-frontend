import { MenuItem, TextField } from '@mui/material';
import {
  useFilterState,
  useUpdateFilter,
  useIsDirty,
  useResetFilters,
  useDirtyState,
  useSetFilterState,
} from '../state';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import {
  useBrands,
  useProductCategories,
  useProductStatuses,
  useProductSubcategories,
} from '~/proxies/aries-proxy/products';

const ProductFilters: React.FC = () => {
  const isDirty = useIsDirty();
  const filters = useFilterState();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();
  const setFilters = useSetFilterState();
  const { data: statuses } = useProductStatuses();
  const { data: brandData } = useBrands();
  const { data: categoryData } = useProductCategories();
  const { data: subcategoryData } = useProductSubcategories(filters.categoryId);

  return (
    <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
      <PrimaryFilters
        dirtyState={dirtyState}
        additionalFilters={['statusId', 'brandId', 'categoryId', 'subcategoryId', 'isKit']}
      >
        <InlineSearchFilter
          name="search"
          value={filters.search}
          onChange={updateFilter}
          sx={{
            maxWidth: 410,
          }}
        />
      </PrimaryFilters>
      <AdditionalFilters>
        <TextField
          select
          size="small"
          label="Stato"
          value={filters.statusId ?? ''}
          onChange={(e) => updateFilter('statusId', e.target.value ? Number(e.target.value) : undefined)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {(statuses ?? []).map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Marca"
          value={filters.brandId ?? ''}
          onChange={(e) => updateFilter('brandId', e.target.value ? e.target.value : undefined)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tutte</MenuItem>
          {(brandData?.brands ?? []).map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>
              {brand.name ?? brand.id}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Categoria merceologica"
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            setFilters((current) => ({
              ...current,
              categoryId: e.target.value ? Number(e.target.value) : undefined,
              subcategoryId: undefined,
            }))
          }
          sx={{ width: 220 }}
        >
          <MenuItem value="">Tutte</MenuItem>
          {(categoryData?.categories ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Sottocategoria"
          value={filters.subcategoryId ?? ''}
          onChange={(e) => updateFilter('subcategoryId', e.target.value ? Number(e.target.value) : undefined)}
          disabled={filters.categoryId === undefined}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tutte</MenuItem>
          {(subcategoryData?.subcategories ?? []).map((subcategory) => (
            <MenuItem key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Kit"
          value={filters.isKit === undefined ? '' : String(filters.isKit)}
          onChange={(e) => updateFilter('isKit', e.target.value ? e.target.value === 'true' : undefined)}
          sx={{ width: 140 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          <MenuItem value="true">Solo kit</MenuItem>
          <MenuItem value="false">Esclusi kit</MenuItem>
        </TextField>
      </AdditionalFilters>
    </CollapsibleFilters>
  );
};

export default ProductFilters;
