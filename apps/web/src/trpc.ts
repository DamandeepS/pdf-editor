import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@inq/server';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});
