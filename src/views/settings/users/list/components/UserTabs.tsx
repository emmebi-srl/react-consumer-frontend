import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ListTabs, { ALL_TAB_KEY } from '~/components/Layout/ListTabs';
import { RouteConfig } from '~/routes/routeConfig';

const UserTabs: React.FC = () => {
  return (
    <ListTabs
      tabs={[{ label: 'Tutti', key: ALL_TAB_KEY }]}
      selectedTabKey={ALL_TAB_KEY}
      onSelect={() => {}}
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          component={Link}
          to={RouteConfig.UserSettingsNew.buildLink()}
        >
          Nuovo utente
        </Button>
      }
    />
  );
};

export default UserTabs;
