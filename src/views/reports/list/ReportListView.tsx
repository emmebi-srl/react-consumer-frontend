import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Add, Refresh } from '@mui/icons-material';
import { Button, Chip, Stack, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import PageContainer from '~/components/Layout/PageContainer';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useMobileReports, useReportsSearch } from '~/proxies/aries-proxy/reports';
import { RouteConfig } from '~/routes/routeConfig';
import { Report, ReportMobileIntervention } from '~/types/aries-proxy/reports';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import ReportAside from './components/ReportAside';
import ReportBar from './components/ReportBar';
import ReportTableHeading from './components/ReportTableHeading';
import ReportTableRow from './components/ReportTableRow';
import { useFilterState } from './state';

const ReportTableComponents: TableComponents<Report> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <ReportTableRow entity={item} {...props} />,
};

const ReportTableRowContent: React.FC<{ report: Report }> = ({ report }) => (
  <>
    <TableCell align="right">
      <MainLabel>{report.id}</MainLabel>
      <SecondaryLabel>{report.year}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{getStringDateByUnixtimestamp(report.date)}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{report.customerId || '-'}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{report.systemId || '-'}</SecondaryLabel>
    </TableCell>
    <TableCell sx={{ maxWidth: 0 }}>
      <MainLabel>{report.technicalReport || '-'}</MainLabel>
      <SecondaryLabel>{report.notesHighlights || report.technicianNotes || ''}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <Chip size="small" label={report.statusName ?? report.statusId} />
    </TableCell>
    <TableCell align="right">
      <SecondaryLabel>{report.price.toFixed(2)} EUR</SecondaryLabel>
    </TableCell>
  </>
);

const MobileReportRow: React.FC<{ report: ReportMobileIntervention }> = ({ report }) => (
  <TableRow hover>
    <TableCell align="right">
      <MainLabel>{report.id}</MainLabel>
      <SecondaryLabel>{report.year}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{getStringDateByUnixtimestamp(report.date)}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{report.customerId || '-'}</SecondaryLabel>
    </TableCell>
    <TableCell>
      <SecondaryLabel>{report.systemId || '-'}</SecondaryLabel>
    </TableCell>
    <TableCell sx={{ maxWidth: 0 }}>
      <MainLabel>{report.technicalReport || '-'}</MainLabel>
      <SecondaryLabel>{report.notesHighlights || ''}</SecondaryLabel>
    </TableCell>
    <TableCell align="right">
      <Button
        component={RouterLink}
        to={RouteConfig.ReportFromMobile.buildLink()}
        state={{ mobileId: report.id, mobileYear: report.year }}
        size="small"
        startIcon={<Add />}
        variant="outlined"
      >
        Gestisci
      </Button>
    </TableCell>
  </TableRow>
);

const ReportListView = () => {
  const filters = useFilterState();
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const queryParams = useMemo(
    () => ({
      customerId: filters.customerId,
      search: filters.search,
      statusId: filters.statusId,
      systemId: filters.systemId,
      year: filters.year,
    }),
    [filters.customerId, filters.search, filters.statusId, filters.systemId, filters.year],
  );

  const reportsQuery = useReportsSearch(queryParams);
  const mobileReportsQuery = useMobileReports();
  const reports = reportsQuery.data?.pages.flatMap((page) => page.reports) ?? [];
  const mobileReports = mobileReportsQuery.data?.reports ?? [];

  return (
    <SplitLayout>
      <SplitMain ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Typography variant="h4">Rapporti</Typography>
              <Button
                component={RouterLink}
                to={RouteConfig.ReportNew.buildLink()}
                variant="contained"
                startIcon={<Add />}
              >
                Nuovo
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  reportsQuery.refetch();
                  mobileReportsQuery.refetch();
                }}
                disabled={reportsQuery.isFetching || mobileReportsQuery.isFetching}
              >
                Aggiorna
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="h6">RAPPORTI MOBILE DA GESTIRE</Typography>
              <DataTableContainer>
                <DataTable>
                  <DataTableHead>
                    <TableRow>
                      <TableCell align="right">Rapporto</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Impianto</TableCell>
                      <TableCell>Relazione</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </DataTableHead>
                  <TableBody>
                    {mobileReports.map((report) => (
                      <MobileReportRow key={`${report.year}-${report.id}`} report={report} />
                    ))}
                    {mobileReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography color="text.secondary" variant="body2">
                            Nessun rapporto mobile da gestire.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </DataTable>
              </DataTableContainer>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="h6">Rapporti</Typography>

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
                <TableVirtuoso<Report>
                  ref={virtuoso}
                  atTopStateChange={setTopReached}
                  customScrollParent={scrollerRef.current || undefined}
                  data={reports}
                  components={ReportTableComponents}
                  endReached={() => {
                    if (!reportsQuery.hasNextPage || reportsQuery.isFetching) return;
                    reportsQuery.fetchNextPage();
                  }}
                  fixedHeaderContent={() => (
                    <ReportTableHeading>
                      <ReportBar />
                    </ReportTableHeading>
                  )}
                  computeItemKey={(_index, report) => `${report.year}-${report.id}`}
                  itemContent={(_index, report) => <ReportTableRowContent report={report} />}
                />
              </DataTableContainer>
            </Stack>
          </Stack>
        </PageContainer>
        <ReportAside />
      </SplitMain>
    </SplitLayout>
  );
};

export default ReportListView;
