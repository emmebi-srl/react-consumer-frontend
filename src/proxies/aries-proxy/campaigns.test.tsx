import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CampaignList } from '~/types/aries-proxy/campaigns';
import { deleteCampaign, getCampaignById, updateCampaign } from './api/campaigns';
import { CampaignQueryKeys, useCampaignById, useDeleteCampaign, useUpdateCampaign } from './campaigns';

vi.mock('./api/campaigns', () => ({
  deleteCampaign: vi.fn(),
  getCampaignById: vi.fn(),
  updateCampaign: vi.fn(),
}));
vi.mock('~/hooks/useExceptionLogger', () => ({ default: () => ({ captureException: vi.fn() }) }));

const original: CampaignList = {
  campaigns: [
    {
      id: 7,
      campaignTypeId: 1,
      name: 'Preventivi',
      description: 'Promemoria',
      mailSubject: 'Preventivo',
      mailTemplatePath: 'template.html',
      active: true,
    },
  ],
};

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(CampaignQueryKeys.byId(7), original);
  client.setQueryData(CampaignQueryKeys.search({}), { pages: [original] });
  client.setQueryData(CampaignQueryKeys.metadata({}), { totalCount: 1 });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('campaign mutations', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([false, true])(
    'refreshes the open aside detail through invalidation when active becomes %s',
    async (active) => {
      const { client, wrapper } = setup();
      const initial = { campaigns: [{ ...original.campaigns[0]!, active: !active }] };
      const updated = { campaigns: [{ ...original.campaigns[0]!, active }] };
      vi.mocked(getCampaignById).mockResolvedValue({ data: initial } as Awaited<ReturnType<typeof getCampaignById>>);
      vi.mocked(updateCampaign).mockResolvedValue({ data: updated } as Awaited<ReturnType<typeof updateCampaign>>);
      const { result } = renderHook(
        () => ({ detail: useCampaignById(7, { includes: 'campaign_type' }), update: useUpdateCampaign() }),
        { wrapper },
      );
      await waitFor(() => expect(result.current.detail.isFetching).toBe(false));
      let resolveRefresh!: (response: Awaited<ReturnType<typeof getCampaignById>>) => void;
      vi.mocked(getCampaignById).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRefresh = resolve;
          }),
      );
      act(() => result.current.update.mutate({ id: 7, data: { active } }));
      await waitFor(() => expect(getCampaignById).toHaveBeenCalledTimes(2));
      expect(getCampaignById).toHaveBeenLastCalledWith(7, { includes: 'campaign_type' });
      // The PATCH response must not change the detail while its GET refresh is pending.
      expect(result.current.detail.data?.campaigns[0]?.active).toBe(!active);
      act(() => resolveRefresh({ data: updated } as Awaited<ReturnType<typeof getCampaignById>>));
      await waitFor(() => expect(result.current.detail.data?.campaigns[0]?.active).toBe(active));
      await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
      expect(client.getQueryState(CampaignQueryKeys.search({}))?.isInvalidated).toBe(true);
      expect(client.getQueryState(CampaignQueryKeys.metadata({}))?.isInvalidated).toBe(true);
      client.clear();
    },
  );

  it('removes deleted detail, refreshes counters and calls the close callback', async () => {
    const { client, wrapper } = setup();
    vi.mocked(deleteCampaign).mockResolvedValue({ status: 204 } as Awaited<ReturnType<typeof deleteCampaign>>);
    const close = vi.fn();
    const { result } = renderHook(() => useDeleteCampaign(), { wrapper });
    act(() => result.current.mutate(7, { onSuccess: close }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(deleteCampaign).toHaveBeenCalledWith(7, expect.anything());
    expect(client.getQueryData(CampaignQueryKeys.byId(7))).toBeUndefined();
    expect(client.getQueryState(CampaignQueryKeys.metadata({}))?.isInvalidated).toBe(true);
    client.clear();
  });

  it('keeps the detail open and cached when deletion fails', async () => {
    const { client, wrapper } = setup();
    vi.mocked(deleteCampaign).mockRejectedValue(new Error('Delete failed'));
    const close = vi.fn();
    const { result } = renderHook(() => useDeleteCampaign(), { wrapper });
    act(() => result.current.mutate(7, { onSuccess: close }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(close).not.toHaveBeenCalled();
    expect(client.getQueryData(CampaignQueryKeys.byId(7))).toEqual(original);
    client.clear();
  });
});
