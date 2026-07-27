"use client";

import { useQuery } from "@tanstack/react-query";

export function useMockData<T>(key: string, loader: () => Promise<T>) {
  const query = useQuery({
    queryKey: ["mock-data", key],
    queryFn: loader,
  });
  return {
    data: query.data ?? null,
    error: query.error,
    loading: query.isLoading,
    retry: query.refetch,
  };
}
