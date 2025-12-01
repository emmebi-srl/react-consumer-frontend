import { useRef, useState } from 'react';
import { Stack } from '@mui/system';
import _isEmpty from 'lodash/isEmpty';
import PageContainer from '~/components/Layout/PageContainer';
import { useCampaignsSearch } from '~/proxies/aries-proxy/campaigns';
import DataTableContainer from '~/components/Table/DataTableContainer';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { Campaign } from '~/types/aries-proxy/campaigns';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTable from '~/components/Table/DataTable';
import { useFilterState, useIsSidebarOpen } from './state';
import CampaignTableRowContent from './components/CampaignTableRowContent';
import CampaignTableHeading from './components/CampaignTableHeading';
import CampaignBar from './components/CampaignBar';
import CampaignTabs from './components/CampaignTabs';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import CampaignTableRow from './components/CampaignTableRow';
import CampaignAside from './components/CampaignAside';

const CampaignsTableComponents: TableComponents<Campaign> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <CampaignTableRow entity={item} {...props} />,
};

const CampaignListView = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();
  const isSidebarOpen = useIsSidebarOpen();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const campaignsQuery = useCampaignsSearch({
    search: filters.search,
    active: filters.active,
    includes: 'campaign_type',
  });
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const campaigns = campaignsQuery.data?.pages.flatMap((page) => page.campaigns) ?? [];

  return (
    <SplitLayout>
      <SplitMain sidebarOpen={isSidebarOpen} ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3} direction="column" flexGrow={1}>
            <CampaignTabs />
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
            <DataTableContainer>
              <TableVirtuoso<Campaign>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                atTopThreshold={100}
                customScrollParent={scrollerRef.current || undefined}
                overscan={{
                  main: 1000,
                  reverse: 1000,
                }}
                components={CampaignsTableComponents}
                endReached={() => {
                  if (!campaignsQuery.hasNextPage || campaignsQuery.isFetching) {
                    return;
                  }

                  campaignsQuery.fetchNextPage();
                }}
                data={campaigns}
                fixedHeaderContent={() => (
                  <CampaignTableHeading>
                    <CampaignBar />
                  </CampaignTableHeading>
                )}
                computeItemKey={(_index: number, campaign: Campaign) => campaign.id}
                itemContent={(_index: number, campaign: Campaign) => {
                  return <CampaignTableRowContent campaign={campaign} />;
                }}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
        <CampaignAside />
      </SplitMain>
    </SplitLayout>
  );
};
export default CampaignListView;
