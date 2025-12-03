import { useMemo, useRef, useState } from 'react';
import { Button, Chip, Stack, TableCell, Typography } from '@mui/material';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import PageContainer from '~/components/Layout/PageContainer';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTable from '~/components/Table/DataTable';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableRow from '~/components/Table/DataTableRow';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useQuotesSearch } from '~/proxies/aries-proxy/quotes';
import { Quote } from '~/types/aries-proxy/quotes';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import { RouteConfig } from '~/routes/routeConfig';
import { Link as RouterLink } from 'react-router-dom';
import QuoteTableHeading from './components/QuoteTableHeading';
import QuoteBar from './components/QuoteBar';
import { useFilterState } from './state';

const QuoteTableComponents: TableComponents<Quote> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const QuoteTableRowContent: React.FC<{ quote: Quote }> = ({ quote }) => {
  const revisions = quote.revisions ?? [];
  const latestRevision = revisions[0];

  return (
    <>
      <TableCell align="right">
        <MainLabel>{quote.id}</MainLabel>
        <SecondaryLabel>{quote.year}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <SecondaryLabel>{quote.note || 'N/A'}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <SecondaryLabel>{quote.status?.name ?? quote.statusId ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <Chip size="small" label={quote.quoteType?.name ?? quote.quoteTypeId} />
      </TableCell>
      <TableCell>
        <SecondaryLabel>{latestRevision?.customer?.companyName ?? '—'}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <SecondaryLabel>
          {latestRevision?.destination
            ? `${latestRevision.destination.municipality} ${latestRevision.destination.province ?? ''}`.trim()
            : '—'}
        </SecondaryLabel>
      </TableCell>
      <TableCell align="center">
        <Chip size="small" label={revisions.length} />
      </TableCell>
      <TableCell align="right">
        <Button
          component={RouterLink}
          to={RouteConfig.QuoteDetail.buildLink({ year: String(quote.year), quoteId: String(quote.id) })}
          size="small"
          variant="outlined"
        >
          Dettaglio
        </Button>
      </TableCell>
    </>
  );
};

const QuoteListView = () => {
  const filters = useFilterState();
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      year: filters.year,
      statusId: filters.statusId,
      typeId: filters.typeId,
      includes: 'revisions,revisions.customer,revisions.destination,status,type',
    }),
    [filters.search, filters.year, filters.statusId, filters.typeId],
  );

  const quotesQuery = useQuotesSearch(queryParams);
  const quotes = quotesQuery.data?.pages.flatMap((page) => page.quotes) ?? [];

  return (
    <SplitLayout>
      <SplitMain ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4">Preventivi</Typography>
              <Button variant="outlined" onClick={() => quotesQuery.refetch()} disabled={quotesQuery.isFetching}>
                Aggiorna
              </Button>
            </Stack>

            <ScrollToTopButton
              onClick={() =>
                virtuoso.current?.scrollToIndex({
                  index: 0,
                  align: 'start',
                  behavior: 'smooth',
                })
              }
              visible={!topReached}
            />

            <DataTableContainer>
              <TableVirtuoso<Quote>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                customScrollParent={scrollerRef.current || undefined}
                data={quotes}
                components={QuoteTableComponents}
                endReached={() => {
                  if (!quotesQuery.hasNextPage || quotesQuery.isFetching) return;
                  quotesQuery.fetchNextPage();
                }}
                fixedHeaderContent={() => (
                  <QuoteTableHeading>
                    <QuoteBar />
                  </QuoteTableHeading>
                )}
                computeItemKey={(_index, quote) => `${quote.year}-${quote.id}`}
                itemContent={(_index, quote) => <QuoteTableRowContent quote={quote} />}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
      </SplitMain>
    </SplitLayout>
  );
};

export default QuoteListView;
