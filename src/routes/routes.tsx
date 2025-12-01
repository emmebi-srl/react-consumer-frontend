import { createBrowserRouter, RouteObject } from 'react-router-dom';
import AppRoot from './AppRoot';
import { RouteConfig } from './routeConfig';
import asyncComponent from '~/components/AsyncComponent';
import { PublicGuard } from './PublicGuard';
import { AuthGuard } from './AuthGuard';
import PrivateAreaLayout from '~/components/PrivateAreaLayout/PrivateAreaLayout';
import RedirectWithQueryParams from './RedirectWithQueryParams';

const Login = asyncComponent(() => import('../views/auth/login/LoginView'));
const Logout = asyncComponent(() => import('../views/auth/logout/LogoutView'));
const InterventionsNearby = asyncComponent(() => import('../views/interventions/nearby/InterventionsNearbyView'));
const CustomerList = asyncComponent(() => import('../views/customers/list/CustomerListView'));
const ChecklistListView = asyncComponent(() => import('../views/checklists/list/ChecklistListView'));
const ChecklistDetailView = asyncComponent(() => import('../views/checklists/detail/ChecklistDetailView'));
const CampaignListView = asyncComponent(() => import('../views/campaigns/list/CampaignListView'));
const CampaignNewView = asyncComponent(() => import('../views/campaigns/new/CampaignNewView'));

const routes: RouteObject[] = [
  {
    path: '*',
    element: <AppRoot />,
    children: [
      {
        path: RouteConfig.Login.template,
        element: (
          <PublicGuard>
            <Login />
          </PublicGuard>
        ),
      },
      {
        path: RouteConfig.Logout.template,
        element: <Logout />,
      },
      {
        path: '*',
        element: (
          <AuthGuard>
            <PrivateAreaLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: RouteConfig.CustomerList.template,
            element: <CustomerList />,
          },
          {
            path: RouteConfig.InterventionsNearby.template,
            element: <InterventionsNearby />,
          },
          {
            path: RouteConfig.ChecklistList.template,
            element: <ChecklistListView />,
          },
          {
            path: RouteConfig.ChecklistDetail.template,
            element: <ChecklistDetailView />,
          },
          {
            path: RouteConfig.CampaignList.template,
            element: <CampaignListView />,
          },
          {
            path: RouteConfig.CampaignNew.template,
            element: <CampaignNewView />,
          },
          {
            path: '*',
            element: <RedirectWithQueryParams path={RouteConfig.InterventionsNearby.buildLink()} />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
