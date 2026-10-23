import { useMemo, useState } from 'react';
import { Stack } from '@mui/system';
import useVirtuosoStateRestoration from '~/hooks/useVirtuosoStateRestoration';
import PageContainer from '~/components/Layout/PageContainer';
import { useProductsSearch } from '~/proxies/aries-proxy/products';
import DataTableContainer from '~/components/Table/DataTableContainer';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { Product } from '~/types/aries-proxy/products';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTable from '~/components/Table/DataTable';
import ProductTableRow from './components/ProductTableRow';
import { useFilterState } from './state';
import ProductTableRowContent from './components/ProductTableRowContent';
import ProductTableHeading from './components/ProductTableHeading';
import ProductBar from './components/ProductBar';
import ProductTabs from './components/ProductTabs';

const ProductsTableComponents: TableComponents<Product> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <ProductTableRow entity={item} {...props} />,
};

const ProductListView = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      statusId: filters.statusId,
      brandId: filters.brandId,
      categoryId: filters.categoryId,
      subcategoryId: filters.subcategoryId,
      isKit: filters.isKit,
      includes: 'status,brand,category,subcategory,production_cost_type',
    }),
    [filters.search, filters.statusId, filters.brandId, filters.categoryId, filters.subcategoryId, filters.isKit],
  );

  const productsQuery = useProductsSearch(queryParams);
  const products = productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const {
    ref: virtuoso,
    restoreStateFrom,
    isScrolling,
  } = useVirtuosoStateRestoration(`products:${JSON.stringify(queryParams)}`, products.length > 0);

  return (
    <PageContainer>
      <Stack
        spacing={3}
        direction="column"
        sx={{
          flexGrow: 1,
          // Without this the flex item grows to the full list height and the page scrolls instead of the table.
          minHeight: 0,
        }}
      >
        <ProductTabs />
        <ScrollToTopButton
          onClick={() => {
            virtuoso.current?.scrollToIndex({
              index: 0,
              align: 'start',
              behavior: 'smooth',
            });
          }}
          visible={!topReached}
        />
        <DataTableContainer sx={{ minHeight: 0 }}>
          <TableVirtuoso<Product>
            ref={virtuoso}
            restoreStateFrom={restoreStateFrom}
            isScrolling={isScrolling}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{
              main: 1000,
              reverse: 1000,
            }}
            components={ProductsTableComponents}
            data={products}
            endReached={() => {
              if (!productsQuery.hasNextPage || productsQuery.isFetching) return;
              productsQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <ProductTableHeading>
                <ProductBar />
              </ProductTableHeading>
            )}
            computeItemKey={(_index: number, product: Product) => product.productCode}
            itemContent={(_index: number, product: Product) => {
              return <ProductTableRowContent product={product} />;
            }}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};
export default ProductListView;
