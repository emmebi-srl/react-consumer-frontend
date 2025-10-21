import React from 'react';
import { Box, Container } from '@mui/system';
import {
  AppBar,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import { RouteConfig } from '~/routes/routeConfig';
import useRouteMatch from '~/hooks/useRouteMatch';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<HTMLButtonElement | null>(null);

  const handleOpenUserMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const isInterventionsActive = Boolean(useRouteMatch([RouteConfig.InterventionsNearby.buildLink()]));
  const isCustomerListActive = Boolean(useRouteMatch([RouteConfig.CustomerList.buildLink()]));

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
            }}
          >
            ARIES
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              component={Link}
              variant={isCustomerListActive ? 'outlined' : 'text'}
              to={RouteConfig.CustomerList.buildLink()}
            >
              Clienti
            </Button>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              component={Link}
              variant={isInterventionsActive ? 'outlined' : 'text'}
              to={RouteConfig.InterventionsNearby.buildLink()}
            >
              Interventi
            </Button>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src={`https://ui-avatars.com/api/?name=user`} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <MuiLink href={RouteConfig.Logout.buildLink()} sx={{ textAlign: 'center' }}>
                  Logout
                </MuiLink>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
