import { RouteConfig } from './routeConfig';

const DEFAULT_POST_LOGIN_REDIRECT = RouteConfig.Dashboard.buildLink();

const getNormalizedRedirectPath = (redirectPath: string | null) => {
  if (!redirectPath || !redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
    return null;
  }

  const targetUrl = new URL(redirectPath, window.location.origin);
  if ([RouteConfig.Login.buildLink(), RouteConfig.Logout.buildLink()].includes(targetUrl.pathname)) {
    return null;
  }

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
};

export const getPostLoginRedirectPath = (searchParams: URLSearchParams) => {
  return getNormalizedRedirectPath(searchParams.get('rd')) ?? DEFAULT_POST_LOGIN_REDIRECT;
};
