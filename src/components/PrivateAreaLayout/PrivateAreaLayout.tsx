import { Box, styled } from '@mui/system';
import Navbar from '../Navbar/Navbar';
import { Outlet } from 'react-router-dom';

const Content = styled('div')({
  padding: '0px',
  width: '100%',
  height: 'calc(100vh - 65px);',
});

const PrivateAreaLayout = () => {
  return (
    <Box sx={{ height: '100%', padding: '0px' }}>
      <Navbar />
      <Content>
        <Outlet />
      </Content>
    </Box>
  );
};

export default PrivateAreaLayout;
