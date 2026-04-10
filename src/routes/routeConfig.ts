const replaceParams = (template: string, params: Record<string, unknown> = {}) => {
  return Object.keys(params).reduce(
    (acc, key) => acc.replace(`:${key}`, String(params[key])),
    template.replace('*', ''),
  );
};
// Based on https://davidtimms.github.io/programming-languages/typescript/2020/11/20/exploring-template-literal-types-in-typescript-4.1.html
type PathParams<Path extends string> = Path extends `:${infer Param}/${infer Rest}`
  ? Param | PathParams<Rest>
  : Path extends `:${infer Param}`
    ? Param
    : Path extends `${infer _Prefix}:${infer Rest}`
      ? PathParams<`:${Rest}`>
      : never;

type PathArgs<Path extends string> = Record<PathParams<Path>, string>;

const defineRoute = <P extends string>(template: P, options: { exact: boolean } = { exact: true }) => {
  type Params = PathParams<P>;
  return {
    template: options.exact ? template : `${template}/*`,
    buildLink: (params: Params extends never ? void : PathArgs<P>) =>
      `/${replaceParams(template, params as PathArgs<P> | undefined)}`,
    buildLinkWithChildPath: (childPath: string, params: Params extends never ? void : PathArgs<P>) =>
      `/${replaceParams(template, params as PathArgs<P> | undefined)}/${childPath}`,
  } as const;
};

export const RouteConfig = {
  AppRoot: defineRoute(''),
  Login: defineRoute('login'),
  Logout: defineRoute('logout'),
  LandingUnsubscribeCampaign: defineRoute('landing/unsubscribe-campaign'),
  LandingAcceptSubscriptionProposal: defineRoute('landing/accept-subscription-proposal'),
  LandingRejectSubscriptionProposal: defineRoute('landing/reject-subscription-proposal'),
  LandingSubscriptionProposalAlreadyHandled: defineRoute('landing/subscription-proposal-already-handled'),
  LandingLinkExpired: defineRoute('landing/link-expired'),
  LandingDoneSubscriptionActivated: defineRoute('landing/done-subscription-activated'),
  LandingDoneNonSubscriber: defineRoute('landing/done-non-subscriber'),
  LandingDoneFreeCheckup: defineRoute('landing/done-free-checkup'),
  CustomerList: defineRoute('customers'),
  SystemList: defineRoute('systems'),
  ChecklistList: defineRoute('checklists'),
  ChecklistDetail: defineRoute('checklists/:checklistId'),
  InterventionsNearby: defineRoute('interventions/nearby'),
  CampaignList: defineRoute('campaigns'),
  CampaignNew: defineRoute('campaigns/new'),
  CampaignDetail: defineRoute('campaigns/:campaignId'),
  QuoteList: defineRoute('quotes'),
  QuoteDetail: defineRoute('quotes/:year/:quoteId'),
};
