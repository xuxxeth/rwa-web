import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const NO_RETRY_STATUS_CODES = [404];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在5秒内未更新时，视为过期
      staleTime: 1000 * 5,
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        return !NO_RETRY_STATUS_CODES.includes(status || 0);
      },
    },
  },
});



export default queryClient;
