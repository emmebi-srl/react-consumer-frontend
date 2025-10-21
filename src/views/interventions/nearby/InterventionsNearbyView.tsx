import SearchErrorMessage from './components/SearchErrorMessage';
import { Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useRef, useState } from 'react';
import { Box, Stack } from '@mui/system';
import { List, Map } from '@mui/icons-material';
import { useWorksToDoByAddress } from '~/proxies/aries-proxy/works';
import PageContainer from '~/components/Layout/PageContainer';
import { WorksToDoByAddressFilter } from '~/proxies/aries-proxy/api/works';
import SearchForm from './components/SearchForm';
import SearchMap from './components/SearchMap';
import SearchList from './components/SearchList';

const NearbyView = () => {
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const mapVisited = useRef(false);

  const [worksToDoFilter, setWorksToDoFilter] = useState<WorksToDoByAddressFilter>({
    city: '',
    address: '',
    distance: 10,
    postalCode: '',
  });
  const worksToDo = useWorksToDoByAddress(worksToDoFilter);

  return (
    <PageContainer>
      <Stack spacing={3} direction="column">
        <SearchErrorMessage error={worksToDo.error} />
        <SearchForm
          isLoading={worksToDo.isLoading}
          onSubmit={(data) =>
            setWorksToDoFilter({
              city: data.city || '',
              address: data.address || '',
              distance: data.rangeKm || 10,
              postalCode: data.postalCode || '',
            })
          }
        />
        <Divider />
        <Box alignSelf={'flex-end'}>
          <ToggleButtonGroup
            exclusive
            aria-label="View Mode"
            value={viewType}
            onChange={(e, value) => {
              if (value === 'map' && !mapVisited.current) {
                mapVisited.current = true;
              }
              setViewType(value as 'list' | 'map');
            }}
          >
            <ToggleButton value="list">
              <List />
            </ToggleButton>
            <ToggleButton value="map">
              <Map />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: viewType === 'list' ? 'block' : 'none', width: '100%', position: 'relative' }}>
          <SearchList data={worksToDo.data?.list} />
        </Box>
        <Box sx={{ display: viewType === 'map' ? 'block' : 'none', width: '100%', position: 'relative' }}>
          {mapVisited.current ? <SearchMap data={worksToDo.data?.list} isLoading={worksToDo.isLoading} /> : null}
        </Box>
      </Stack>
    </PageContainer>
  );
};
export default NearbyView;
