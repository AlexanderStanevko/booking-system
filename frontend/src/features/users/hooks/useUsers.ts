import { useQuery } from '@tanstack/react-query';
import { queryKeys, queryPolicy } from '../../../api/queryClient';
import { getUsers } from '../api/users';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: ({ signal }) => getUsers(signal),
    refetchInterval: queryPolicy.refreshInterval,
  });
}
