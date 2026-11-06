import { createBrowserRouter, RouteObject } from 'react-router-dom';
import AppRoot from './AppRoot';
import { RouteConfig } from './routeConfig';
import { ModuleGuard } from './ModuleGuard';
import { AriesModule } from '~/types/aries-proxy/users';
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
const CustomerDetail = asyncComponent(() => import('../views/customers/detail/CustomerDetailView'));
const CustomerNew = asyncComponent(() => import('../views/customers/new/CustomerNewView'));
const SystemList = asyncComponent(() => import('../views/systems/list/SystemListView'));
const ProductList = asyncComponent(() => import('../views/products/list/ProductListView'));
const ProductDetail = asyncComponent(() => import('../views/products/detail/ProductDetailView'));
const ProductNew = asyncComponent(() => import('../views/products/new/ProductNewView'));
const ProductPriceCharge = asyncComponent(() => import('../views/products/price-charge/ProductPriceChargeView'));
const ChecklistListView = asyncComponent(() => import('../views/checklists/list/ChecklistListView'));
const ChecklistDetailView = asyncComponent(() => import('../views/checklists/detail/ChecklistDetailView'));
const CampaignListView = asyncComponent(() => import('../views/campaigns/list/CampaignListView'));
const CampaignNewView = asyncComponent(() => import('../views/campaigns/new/CampaignNewView'));
const CampaignDetailView = asyncComponent(() => import('../views/campaigns/detail/CampaignDetailView'));
const EmailListView = asyncComponent(() => import('../views/emails/EmailListView'));
const DdtListView = asyncComponent(() => import('../views/ddts/list/DdtListView'));
const DdtEditorView = asyncComponent(() => import('../views/ddts/editor/DdtEditorView'));
const DdtSettingsView = asyncComponent(() => import('../views/ddts/settings/DdtSettingsView'));
const WhatsappMessageListView = asyncComponent(() => import('../views/whatsapp/WhatsappMessageListView'));
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
            element: (
              <ModuleGuard moduleId={AriesModule.Settings}>
                <CompanySettingsView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.CustomerList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Customers}>
                <CustomerList />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.CustomerNew.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Customers}>
                <CustomerNew />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.CustomerDetail.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Customers}>
                <CustomerDetail />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.SystemList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Systems}>
                <SystemList />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ProductList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Products}>
                <ProductList />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ProductNew.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Products}>
                <ProductNew />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ProductPriceCharge.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Products}>
                <ProductPriceCharge />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ProductDetail.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Products}>
                <ProductDetail />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.InterventionsNearby.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Systems}>
                <InterventionsNearby />
              </ModuleGuard>
            ),
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
            path: RouteConfig.EmailList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Emails}>
                <EmailListView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.DdtList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Ddts}>
                <DdtListView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.DdtNew.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Ddts}>
                <DdtEditorView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.DdtSettings.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Ddts}>
                <DdtSettingsView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.DdtDetail.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Ddts}>
                <DdtEditorView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.WhatsappMessageList.template,
            element: <WhatsappMessageListView />,
          },
          {
            path: RouteConfig.QuoteList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Quotes}>
                <QuoteListView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.QuoteDetail.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Quotes}>
                <QuoteDetailView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.QuoteRevisionEdit.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Quotes}>
                <QuoteRevisionEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.QuoteLotNew.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Quotes}>
                <QuoteLotEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.QuoteLotEdit.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Quotes}>
                <QuoteLotEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ReportList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Reports}>
                <ReportListView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ReportNew.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Reports}>
                <ReportEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ReportFromMobile.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Reports}>
                <ReportEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.ReportEdit.template,
            element: (
              <ModuleGuard moduleId={AriesModule.Reports}>
                <ReportEditView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.SupplierInvoiceList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.SupplierInvoices}>
                <SupplierInvoiceListView />
              </ModuleGuard>
            ),
          },
          {
            path: RouteConfig.SupplierInvoicePeriodicConfigurationList.template,
            element: (
              <ModuleGuard moduleId={AriesModule.SupplierInvoices}>
                <SupplierInvoicePeriodicConfigurationListView />
              </ModuleGuard>
            ),
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
