import { Box, styled } from '@mui/system';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import PasskeyLoginPrompt from '../Users/PasskeyLoginPrompt';

const Content = styled('div')(({ theme }) => ({
  padding: '0px',
  flexGrow: 1,
  minWidth: 0,
  height: '100vh',
  // Mobile: below the header of the Sidebar, in the remaining height.
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    minHeight: 0,
  },
}));

const PrivateAreaLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: '100dvh', md: '100%' },
        padding: '0px',
      }}
    >
      <Sidebar />
      <PasskeyLoginPrompt />
      <Content>
        <Outlet />
      </Content>
    </Box>
  );
};

export default PrivateAreaLayout;
