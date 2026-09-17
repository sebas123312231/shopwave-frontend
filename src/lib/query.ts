import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (failureCount >= 1) return false;
          if (error instanceof Error && 'status' in error) {
            const status = (error as Error & { status?: number }).status;
            return status === 502 || status === 503 || status === 504;
          }
          return true;
        },
      },
      mutations: { retry: false },
    },
  });
}
