import { PageHeader } from '../components/common/PageHeader';
import { QueryState } from '../components/common/QueryState';
import { TablePanel } from '../components/common/TablePanel';
import { UserTable } from '../features/users/components/UserTable';
import { useUsers } from '../features/users/hooks/useUsers';
import { usePagination } from '../hooks/usePagination';

export default function UsersPage() {
  const users = useUsers();
  const pagination = usePagination(users.data ?? []);
  return (
    <>
      <PageHeader
        title="Users"
        description="Your colleagues and the meetings they are organizing."
        onRefresh={() => void users.refetch()}
        refreshing={users.isFetching}
      />
      <QueryState
        pending={users.isPending}
        error={users.error}
        empty={users.data?.length === 0}
        emptyMessage="There are no users in this workspace yet."
        onRetry={() => void users.refetch()}
      >
        <TablePanel
          title="Workspace directory"
          count={users.data?.length ?? 0}
          refreshing={users.isFetching}
          pagination={pagination.controls}
        >
          <UserTable users={pagination.items} />
        </TablePanel>
      </QueryState>
    </>
  );
}
