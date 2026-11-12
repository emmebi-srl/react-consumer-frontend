import React, { ReactNode } from 'react';
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  SxProps,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UnfoldMore from '@mui/icons-material/UnfoldMore';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import HomeWorkOutlined from '@mui/icons-material/HomeWorkOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import RequestQuoteOutlined from '@mui/icons-material/RequestQuoteOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import AlternateEmailOutlined from '@mui/icons-material/AlternateEmailOutlined';
import MailOutlined from '@mui/icons-material/MailOutlined';
import WhatsApp from '@mui/icons-material/WhatsApp';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import ChecklistOutlined from '@mui/icons-material/ChecklistOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import SettingsSuggestOutlined from '@mui/icons-material/SettingsSuggestOutlined';
import { Link } from 'react-router-dom';
import Logo from '~/components/Layout/Logo';
import { RouteConfig } from '~/routes/routeConfig';
import useRouteMatch from '~/hooks/useRouteMatch';
import { useIsAriesAdmin, useUserMe, useUserModulePermissions } from '~/proxies/aries-proxy/users';
import { AriesModule } from '~/types/aries-proxy/users';

export const SIDEBAR_WIDTH = 248;

// Navy shades derived from palette.primary.dark (#2e6499)
const SIDEBAR_BG_TOP = '#173a5e';
const SIDEBAR_BG_BOTTOM = '#0d2640';
const TEXT_MUTED = alpha('#ffffff', 0.72);

interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  /** Hidden when the user can't open this module. */
  moduleId?: number;
  /** Hidden for the users without the `aries_admin` role (Delphi admin settings). */
  adminOnly?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

const sections: SidebarSection[] = [
  {
    items: [{ label: 'Dashboard', path: RouteConfig.Dashboard.buildLink(), icon: <DashboardOutlined /> }],
  },
  {
    title: 'Anagrafiche',
    items: [
      {
        label: 'Clienti',
        path: RouteConfig.CustomerList.buildLink(),
        icon: <PeopleOutlined />,
        moduleId: AriesModule.Customers,
      },
      {
        label: 'Impianti',
        path: RouteConfig.SystemList.buildLink(),
        icon: <HomeWorkOutlined />,
        moduleId: AriesModule.Systems,
      },
      {
        label: 'Articoli',
        path: RouteConfig.ProductList.buildLink(),
        icon: <Inventory2Outlined />,
        moduleId: AriesModule.Products,
      },
    ],
  },
  {
    title: 'Documenti',
    items: [
      {
        label: 'Preventivi',
        path: RouteConfig.QuoteList.buildLink(),
        icon: <RequestQuoteOutlined />,
        moduleId: AriesModule.Quotes,
      },
      {
        label: 'Rapporti',
        path: RouteConfig.ReportList.buildLink(),
        icon: <AssignmentOutlined />,
        moduleId: AriesModule.Reports,
      },
      {
        label: 'DDT',
        path: RouteConfig.DdtList.buildLink(),
        icon: <LocalShippingOutlined />,
        moduleId: AriesModule.Ddts,
      },
      {
        label: 'Fatture Fornitori',
        path: RouteConfig.SupplierInvoiceList.buildLink(),
        icon: <ReceiptLongOutlined />,
        moduleId: AriesModule.SupplierInvoices,
      },
    ],
  },
  {
    title: 'Comunicazioni',
    items: [
      {
        label: 'Email',
        path: RouteConfig.EmailList.buildLink(),
        icon: <AlternateEmailOutlined />,
        moduleId: AriesModule.Emails,
      },
      { label: 'Campagne Mail', path: RouteConfig.CampaignList.buildLink(), icon: <MailOutlined /> },
      { label: 'WhatsApp', path: RouteConfig.WhatsappMessageList.buildLink(), icon: <WhatsApp /> },
    ],
  },
  {
    title: 'Operatività',
    items: [
      {
        label: 'Interventi',
        path: RouteConfig.InterventionsNearby.buildLink(),
        icon: <BuildOutlined />,
        moduleId: AriesModule.Systems,
      },
      { label: 'Checklist', path: RouteConfig.ChecklistList.buildLink(), icon: <ChecklistOutlined /> },
    ],
  },
  {
    title: 'Impostazioni',
    items: [
      {
        label: 'Azienda',
        path: RouteConfig.CompanySettings.buildLink(),
        icon: <BusinessOutlined />,
        moduleId: AriesModule.Settings,
      },
      {
        label: 'Servizi',
        path: RouteConfig.ServiceSettings.buildLink(),
        icon: <SettingsSuggestOutlined />,
        adminOnly: true,
      },
    ],
  },
];

const allPaths = sections.flatMap((section) => section.items.map((item) => item.path));

const UserMenu = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<HTMLElement | null>(null);
  const { data: userData } = useUserMe();
  const user = userData?.users.at(0);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <ListItemButton
        onClick={(event) => setAnchorElUser(event.currentTarget)}
        sx={{
          gap: 1.5,
          mx: 1.5,
          my: 1.5,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha('#ffffff', 0.06),
          '&:hover': { bgcolor: alpha('#ffffff', 0.12) },
        }}
      >
        <Avatar
          alt="User"
          src={`https://ui-avatars.com/api/?name=${user?.username ?? 'User'}`}
          sx={{ width: 34, height: 34, border: `2px solid ${alpha('#ffffff', 0.3)}` }}
        />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ color: 'common.white', fontWeight: 500 }}>
            {user?.username}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: TEXT_MUTED, display: 'block' }}>
            Account
          </Typography>
        </Box>
        <UnfoldMore fontSize="small" sx={{ color: TEXT_MUTED }} />
      </ListItemButton>
      <Menu
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem component={Link} onClick={handleCloseUserMenu} to={RouteConfig.Logout.buildLink()}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const activePath = useRouteMatch(allPaths);
  const { data: modulePermissions } = useUserModulePermissions();
  const { isAdmin } = useIsAriesAdmin();
  const isVisible = (item: SidebarItem) =>
    (!item.adminOnly || isAdmin) &&
    (!item.moduleId || !!modulePermissions?.permissions.find((module) => module.moduleId === item.moduleId)?.isEnabled);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        component={Link}
        to={RouteConfig.Dashboard.buildLink()}
        onClick={onNavigate}
        sx={{ display: 'flex', justifyContent: 'center', px: 2, pt: 2.5, pb: 2, textDecoration: 'none' }}
      >
        <Logo
          sx={{
            backgroundColor: 'common.white',
            borderRadius: 2,
            padding: 0.75,
            boxShadow: `0 4px 12px ${alpha('#000000', 0.25)}`,
          }}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pb: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha('#ffffff', 0.2)} transparent`,
        }}
      >
        {sections
          .map((section) => ({ ...section, items: section.items.filter(isVisible) }))
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <List
              key={section.title ?? 'main'}
              disablePadding
              sx={{ mt: section.title ? 2 : 1 }}
              subheader={
                section.title && (
                  <ListSubheader
                    disableSticky
                    sx={{
                      lineHeight: '28px',
                      px: 3,
                      bgcolor: 'transparent',
                      color: alpha('#ffffff', 0.45),
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.title}
                  </ListSubheader>
                )
              }
            >
              {section.items.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={onNavigate}
                  selected={item.path === activePath}
                  sx={navItemSx}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: 'inherit', '& svg': { fontSize: 20 } }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 'inherit' } } }}
                  />
                </ListItemButton>
              ))}
            </List>
          ))}
      </Box>

      <Box sx={{ borderTop: `1px solid ${alpha('#ffffff', 0.08)}` }}>
        <UserMenu />
      </Box>
    </Box>
  );
};

const navItemSx: SxProps<Theme> = (theme) => ({
  mx: 1.5,
  my: 0.25,
  px: 1.5,
  py: 0.75,
  borderRadius: 2,
  color: TEXT_MUTED,
  fontWeight: 500,
  transition: theme.transitions.create(['background-color', 'color']),
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.08),
    color: 'common.white',
  },
  '&.Mui-selected': {
    bgcolor: theme.palette.primary.main,
    color: 'common.white',
    fontWeight: 600,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  '&.Mui-selected:hover': {
    bgcolor: theme.palette.primary.main,
  },
});

const paperSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  boxSizing: 'border-box',
  border: 'none',
  background: `linear-gradient(180deg, ${SIDEBAR_BG_TOP} 0%, ${SIDEBAR_BG_BOTTOM} 100%)`,
  color: 'common.white',
};

export const MOBILE_HEADER_HEIGHT = 56;

const titledItems = sections.flatMap((section) => section.items);
const titledPaths = titledItems.map((item) => item.path);

/** Mobile only: top bar with the menu button and the current section (e.g. CLIENTI, DDT). */
const MobileHeader: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const activePath = useRouteMatch(titledPaths);
  const title = titledItems.find((item) => item.path === activePath)?.label ?? 'Aries';

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        top: 0,
        flexShrink: 0,
        background: `linear-gradient(90deg, ${SIDEBAR_BG_TOP} 0%, ${SIDEBAR_BG_BOTTOM} 100%)`,
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: MOBILE_HEADER_HEIGHT, height: MOBILE_HEADER_HEIGHT, px: 1, gap: 1 }}>
        <IconButton aria-label="Apri il menu" onClick={onOpenMenu} sx={{ color: 'common.white' }}>
          <MenuIcon />
        </IconButton>
        <Typography
          component="h1"
          noWrap
          sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <>
      <MobileHeader onOpenMenu={() => setMobileOpen(true)} />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': paperSx }}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </>
  );
};

export default Sidebar;
