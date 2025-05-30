import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";

type FetchFunction<T> = () => Promise<T>;

export function useQueryData<T>(
  queryKey: QueryKey,
  fetchFunction: FetchFunction<T>,
  options?: Omit<
    UseQueryOptions<T, Error, T, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<T, Error, T, QueryKey>({
    queryKey,
    queryFn: fetchFunction,
    ...options,
  });
}

export function useQueryWithParams<T, P>(
  queryKey: QueryKey,
  fetchFunction: (params: P) => Promise<T>,
  params: P,
  options?: Omit<
    UseQueryOptions<T, Error, T, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  const finalQueryKey = [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params];
  
  return useQuery<T, Error, T, QueryKey>({
    queryKey: finalQueryKey,
    queryFn: () => fetchFunction(params),
    ...options,
  });
}
