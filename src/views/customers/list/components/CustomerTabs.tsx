import { Add } from '@mui/icons-material';
import { Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigationTabs, { StateTabData } from '~/components/Layout/NavigationTabs';
import { RouteConfig } from '~/routes/routeConfig';

const Container = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  // Mobile: no side padding, buttons wrap below the tabs.
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
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

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        component={Link}
        to={RouteConfig.CustomerNew.buildLink()}
      >
        Nuovo cliente
      </Button>
    </Container>
  );
};

export default CustomerTabs;
