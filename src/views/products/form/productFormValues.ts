import { Product, ProductSaveRequest } from '~/types/aries-proxy/products';
import { decodeRtf, encodeRtfText } from '~/utils/rtf-utils';

export interface ProductFormValues {
  // Only editable when creating (empty = automatic code).
  productCode: string;
  // Only settable when creating (like the Delphi client): the composition is edited on the detail page.
  isKit: boolean;
  description: string;
  barcode: string;
  supplierProductCode: string;
  brandCode: string;
  supplierId: number | '';
  supplierName: string;
  status: number | '';
  productionCostTypeId: number | '';
  categoryId: number | '';
  subcategoryId: number | '';
  subcategoryLevel2Id: number | '';
  measurementUnits: string;
  installationTime: number | '';
  maintenanceMinutes: number | '';
  expirationMonths: number | '';
  warrantyMonths: number | '';
  minQuantity: number | '';
  maxQuantity: number | '';
  packageQuantity: number | '';
  weight: number | '';
  height: number | '';
  width: number | '';
  depth: number | '';
  minTemperature: number | '';
  maxTemperature: number | '';
  humidity: number | '';
  liters: number | '';
  standbyAbsorption: number | '';
  activeAbsorption: number | '';
  multiplier: number | '';
  color: string;
  depotPositionDescription: string;
  depotShelf: string;
  depotShelfTier: string;
  // Plain text (decoded from the stored RTF).
  extendedDescription: string;
}

export const PRODUCT_DETAIL_INCLUDES = [
  'status',
  'brand',
  'category',
  'subcategory',
  'subcategory_level2',
  'measurement_unit',
  'production_cost_type',
  'supplier',
  'codes',
  'spare_parts',
  'equipment',
  'operations',
  'notes',
  'extended_description',
  'regulations',
  'price_list_entries',
  'kit_components',
].join(',');

export const getProductFormValues = (product?: Product): ProductFormValues => ({
  productCode: product?.productCode ?? '',
  isKit: product?.isKit ?? false,
  description: product?.description ?? '',
  barcode: product?.barcode ?? '',
  supplierProductCode: product?.supplierProductCode ?? '',
  brandCode: product?.brandCode ?? '',
  supplierId: product?.supplierId ?? '',
  supplierName: product?.supplier?.companyName ?? '',
  status: product?.status ?? '',
  productionCostTypeId: product?.productionCostTypeId ?? '',
  categoryId: product?.categoryId ?? '',
  subcategoryId: product?.subcategoryId ?? '',
  subcategoryLevel2Id: product?.subcategoryLevel2Id ?? '',
  measurementUnits: product?.measurementUnits ?? '',
  installationTime: product?.installationTime ?? 0,
  maintenanceMinutes: product?.maintenanceMinutes ?? 0,
  expirationMonths: product?.expirationMonths ?? 0,
  warrantyMonths: product?.warrantyMonths ?? 0,
  minQuantity: product?.minQuantity ?? 0,
  maxQuantity: product?.maxQuantity ?? 0,
  packageQuantity: product?.packageQuantity ?? 0,
  weight: product?.weight ?? 0,
  height: product?.height ?? 0,
  width: product?.width ?? 0,
  depth: product?.depth ?? 0,
  minTemperature: product?.minTemperature ?? 0,
  maxTemperature: product?.maxTemperature ?? 0,
  humidity: product?.humidity ?? 0,
  liters: product?.liters ?? 0,
  standbyAbsorption: product?.standbyAbsorption ?? 0,
  activeAbsorption: product?.activeAbsorption ?? 0,
  multiplier: product?.multiplier ?? 1,
  color: product?.color ?? '',
  depotPositionDescription: product?.depotPositionDescription ?? '',
  depotShelf: product?.depotShelf ?? '',
  depotShelfTier: product?.depotShelfTier ?? '',
  extendedDescription: decodeRtf(product?.extendedDescription),
});

const toNumber = (value: number | '') => (value === '' ? 0 : value);
const toNullableNumber = (value: number | '') => (value === '' ? null : value);
const toNullableString = (value: string) => (value.trim() === '' ? null : value.trim());

// The extended description is re-encoded (and sent) only when changed, to keep the Delphi RTF formatting.
export const toProductSaveRequest = (
  values: ProductFormValues,
  extendedDescriptionChanged: boolean,
): ProductSaveRequest => ({
  description: values.description,
  barcode: values.barcode,
  supplierProductCode: values.supplierProductCode,
  brandCode: toNullableString(values.brandCode),
  supplierId: toNullableNumber(values.supplierId),
  status: toNumber(values.status),
  productionCostTypeId: toNullableNumber(values.productionCostTypeId),
  categoryId: toNullableNumber(values.categoryId),
  subcategoryId: toNullableNumber(values.subcategoryId),
  subcategoryLevel2Id: toNullableNumber(values.subcategoryLevel2Id),
  measurementUnits: toNullableString(values.measurementUnits),
  installationTime: toNumber(values.installationTime),
  maintenanceMinutes: toNumber(values.maintenanceMinutes),
  expirationMonths: toNumber(values.expirationMonths),
  warrantyMonths: toNumber(values.warrantyMonths),
  minQuantity: toNumber(values.minQuantity),
  maxQuantity: toNumber(values.maxQuantity),
  packageQuantity: toNumber(values.packageQuantity),
  weight: toNumber(values.weight),
  height: toNumber(values.height),
  width: toNumber(values.width),
  depth: toNumber(values.depth),
  minTemperature: toNumber(values.minTemperature),
  maxTemperature: toNumber(values.maxTemperature),
  humidity: toNumber(values.humidity),
  liters: toNumber(values.liters),
  standbyAbsorption: toNumber(values.standbyAbsorption),
  activeAbsorption: toNumber(values.activeAbsorption),
  multiplier: toNumber(values.multiplier),
  color: toNullableString(values.color),
  depotPositionDescription: values.depotPositionDescription,
  depotShelf: values.depotShelf,
  depotShelfTier: values.depotShelfTier,
  extendedDescription: extendedDescriptionChanged ? encodeRtfText(values.extendedDescription) : undefined,
});
