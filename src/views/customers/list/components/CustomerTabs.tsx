import { Add } from '@mui/icons-material';
import { Box, Button, styled, Tooltip } from '@mui/material';
import NavigationTabs, { StateTabData } from '~/components/Layout/NavigationTabs';

const Container = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Tabs: StateTabData[] = [
  {
    label: 'Tutti',
    key: 'all',
  },
];

const CustomerTabs: React.FC = () => {
  return (
    <Container>
      <NavigationTabs tabs={Tabs} selectedTabKey="all" onSelect={() => {}} />

      <Tooltip title="In arrivo">
        {/* Disabled buttons don't emit mouse events, so the tooltip needs a wrapper. */}
        <Box component="span">
          <Button variant="contained" color="primary" startIcon={<Add />} disabled>
            Nuovo cliente
          </Button>
        </Box>
      </Tooltip>
    </Container>
  );
};

export default CustomerTabs;
