import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const NO_RETRY_STATUS_CODES = [404];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 2,
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        return !NO_RETRY_STATUS_CODES.includes(status || 0);
      },
    },
  },
});

export default queryClient;
