import { describe, expect, it } from 'vitest';
import { getPostLoginRedirectPath } from './loginRedirect';
import { RouteConfig } from './routeConfig';

describe('getPostLoginRedirectPath', () => {
  it('returns the requested internal redirect path', () => {
    const searchParams = new URLSearchParams({
      rd: '/campaigns/2?openCreateSubscriptionModal=1&campaignMailId=1',
    });

    expect(getPostLoginRedirectPath(searchParams)).toBe('/campaigns/2?openCreateSubscriptionModal=1&campaignMailId=1');
  });

  it('falls back to the dashboard when the redirect is missing', () => {
    expect(getPostLoginRedirectPath(new URLSearchParams())).toBe(RouteConfig.Dashboard.buildLink());
  });

  it('falls back to the dashboard for unsafe redirects', () => {
    expect(getPostLoginRedirectPath(new URLSearchParams({ rd: 'https://example.com' }))).toBe(
      RouteConfig.Dashboard.buildLink(),
    );
    expect(getPostLoginRedirectPath(new URLSearchParams({ rd: '//example.com/path' }))).toBe(
      RouteConfig.Dashboard.buildLink(),
    );
  });

  it('falls back to the dashboard for auth routes', () => {
    expect(getPostLoginRedirectPath(new URLSearchParams({ rd: RouteConfig.Login.buildLink() }))).toBe(
      RouteConfig.Dashboard.buildLink(),
    );
    expect(getPostLoginRedirectPath(new URLSearchParams({ rd: RouteConfig.Logout.buildLink() }))).toBe(
      RouteConfig.Dashboard.buildLink(),
    );
  });
});
