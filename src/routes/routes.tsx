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
const LandingUnsubscribeCampaignView = asyncComponent(
  () => import('../views/landing/unsubscribe-campaign/UnsubscribeCampaignView'),
);
const LandingAcceptSubscriptionProposalView = asyncComponent(
  () => import('../views/landing/accept-subscription-proposal/AcceptSubscriptionProposalView'),
);
const LandingRejectSubscriptionProposalView = asyncComponent(
  () => import('../views/landing/reject-subscription-proposal/RejectSubscriptionProposalView'),
);
const LandingSubscriptionProposalAlreadyHandledView = asyncComponent(
  () => import('../views/landing/subscription-proposal-already-handled/SubscriptionProposalAlreadyHandledView'),
);
const LandingLinkExpiredView = asyncComponent(() => import('../views/landing/link-expired/LinkExpiredView'));
const LandingDoneSubscriptionActivatedView = asyncComponent(
  () => import('../views/landing/done-subscription-activated/LandingDoneSubscriptionActivatedView'),
);
const LandingDoneNonSubscriberView = asyncComponent(
  () => import('../views/landing/done-non-subscriber/LandingDoneNonSubscriberView'),
);
const LandingDoneFreeCheckupView = asyncComponent(
  () => import('../views/landing/done-free-checkup/LandingDoneFreeCheckupView'),
);
const InterventionsNearby = asyncComponent(() => import('../views/interventions/nearby/InterventionsNearbyView'));
const CustomerList = asyncComponent(() => import('../views/customers/list/CustomerListView'));
const ChecklistListView = asyncComponent(() => import('../views/checklists/list/ChecklistListView'));
const ChecklistDetailView = asyncComponent(() => import('../views/checklists/detail/ChecklistDetailView'));
const CampaignListView = asyncComponent(() => import('../views/campaigns/list/CampaignListView'));
const CampaignNewView = asyncComponent(() => import('../views/campaigns/new/CampaignNewView'));
const CampaignDetailView = asyncComponent(() => import('../views/campaigns/detail/CampaignDetailView'));
const QuoteListView = asyncComponent(() => import('../views/quotes/list/QuoteListView'));
const QuoteDetailView = asyncComponent(() => import('../views/quotes/detail/QuoteDetailView'));

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
        path: RouteConfig.LandingUnsubscribeCampaign.template,
        element: <LandingUnsubscribeCampaignView />,
      },
      {
        path: RouteConfig.LandingAcceptSubscriptionProposal.template,
        element: <LandingAcceptSubscriptionProposalView />,
      },
      {
        path: RouteConfig.LandingRejectSubscriptionProposal.template,
        element: <LandingRejectSubscriptionProposalView />,
      },
      {
        path: RouteConfig.LandingSubscriptionProposalAlreadyHandled.template,
        element: <LandingSubscriptionProposalAlreadyHandledView />,
      },
      {
        path: RouteConfig.LandingLinkExpired.template,
        element: <LandingLinkExpiredView />,
      },
      {
        path: RouteConfig.LandingDoneSubscriptionActivated.template,
        element: <LandingDoneSubscriptionActivatedView />,
      },
      {
        path: RouteConfig.LandingDoneNonSubscriber.template,
        element: <LandingDoneNonSubscriberView />,
      },
      {
        path: RouteConfig.LandingDoneFreeCheckup.template,
        element: <LandingDoneFreeCheckupView />,
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
            path: RouteConfig.CampaignDetail.template,
            element: <CampaignDetailView />,
          },
          {
            path: RouteConfig.QuoteList.template,
            element: <QuoteListView />,
          },
          {
            path: RouteConfig.QuoteDetail.template,
            element: <QuoteDetailView />,
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
