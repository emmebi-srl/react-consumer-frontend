import { Box, styled } from '@mui/system';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

const Content = styled('div')({
  padding: '0px',
  flexGrow: 1,
  minWidth: 0,
  height: '100vh',
});

const PrivateAreaLayout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100%', padding: '0px' }}>
      <Sidebar />
      <Content>
        <Outlet />
      </Content>
    </Box>
  );
};

export default PrivateAreaLayout;
