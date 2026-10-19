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
}));

const Tabs: StateTabData[] = [
  {
    label: 'Tutti',
    key: 'all',
  },
];

// Same header as CustomerTabs.
const ProductTabs: React.FC = () => {
  return (
    <Container>
      <NavigationTabs tabs={Tabs} selectedTabKey="all" onSelect={() => {}} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        component={Link}
        to={RouteConfig.ProductNew.buildLink()}
      >
        Nuovo articolo
      </Button>
    </Container>
  );
};

export default ProductTabs;
