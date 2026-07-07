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
const SystemList = asyncComponent(() => import('../views/systems/list/SystemListView'));
const ChecklistListView = asyncComponent(() => import('../views/checklists/list/ChecklistListView'));
const ChecklistDetailView = asyncComponent(() => import('../views/checklists/detail/ChecklistDetailView'));
const CampaignListView = asyncComponent(() => import('../views/campaigns/list/CampaignListView'));
const CampaignNewView = asyncComponent(() => import('../views/campaigns/new/CampaignNewView'));
const CampaignDetailView = asyncComponent(() => import('../views/campaigns/detail/CampaignDetailView'));
const QuoteListView = asyncComponent(() => import('../views/quotes/list/QuoteListView'));
const QuoteDetailView = asyncComponent(() => import('../views/quotes/detail/QuoteDetailView'));
const QuoteRevisionEditView = asyncComponent(() => import('../views/quotes/revision-edit/QuoteRevisionEditView'));
const QuoteLotEditView = asyncComponent(() => import('../views/quotes/lot-edit/QuoteLotEditView'));
const ReportListView = asyncComponent(() => import('../views/reports/list/ReportListView'));
const ReportEditView = asyncComponent(() => import('../views/reports/edit/ReportEditView'));
const SupplierInvoiceListView = asyncComponent(() => import('../views/supplier-invoices/list/SupplierInvoiceListView'));
const SupplierInvoicePeriodicConfigurationListView = asyncComponent(
  () => import('../views/supplier-invoices/periodic-configurations/SupplierInvoicePeriodicConfigurationListView'),
);
const DashboardView = asyncComponent(() => import('../views/dashboard/DashboardView'));
const CompanySettingsView = asyncComponent(() => import('../views/company/CompanySettingsView'));

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
            path: RouteConfig.Dashboard.template,
            element: <DashboardView />,
          },
          {
            path: RouteConfig.CompanySettings.template,
            element: <CompanySettingsView />,
          },
          {
            path: RouteConfig.CustomerList.template,
            element: <CustomerList />,
          },
          {
            path: RouteConfig.SystemList.template,
            element: <SystemList />,
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
            path: RouteConfig.QuoteRevisionEdit.template,
            element: <QuoteRevisionEditView />,
          },
          {
            path: RouteConfig.QuoteLotNew.template,
            element: <QuoteLotEditView />,
          },
          {
            path: RouteConfig.QuoteLotEdit.template,
            element: <QuoteLotEditView />,
          },
          {
            path: RouteConfig.ReportList.template,
            element: <ReportListView />,
          },
          {
            path: RouteConfig.ReportNew.template,
            element: <ReportEditView />,
          },
          {
            path: RouteConfig.ReportFromMobile.template,
            element: <ReportEditView />,
          },
          {
            path: RouteConfig.ReportEdit.template,
            element: <ReportEditView />,
          },
          {
            path: RouteConfig.SupplierInvoiceList.template,
            element: <SupplierInvoiceListView />,
          },
          {
            path: RouteConfig.SupplierInvoicePeriodicConfigurationList.template,
            element: <SupplierInvoicePeriodicConfigurationListView />,
          },
          {
            path: '*',
            element: <RedirectWithQueryParams path={RouteConfig.Dashboard.buildLink()} />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
