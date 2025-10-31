import { assertSuperuser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import UserRoleForm from './UserRoleForm';

type ManagedUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: 'user' | 'superuser';
  rawRole: string;
  createdAt: string | null;
};

export default async function UserManagementPage() {
  const { user: currentUser } = await assertSuperuser();
  const supabaseAdmin = createSupabaseAdminClient();

  const [{ data: profilesData, error: profilesError }, { data: authUsersData, error: usersError }] =
    await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, role'),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
    ]);

  if (profilesError) {
    throw new Error(profilesError.message ?? 'Failed to load profiles.');
  }

  if (usersError) {
    throw usersError;
  }

  const profiles = profilesData ?? [];
  const authUsers = authUsersData?.users ?? [];
  const managedUsers: ManagedUser[] = authUsers
    .map((authUser) => {
      const profile = profiles.find((p) => p.id === authUser.id);
      const profileRole = profile?.role ?? 'user';
      const normalizedRole = profileRole === 'admin' ? 'superuser' : profileRole;

      return {
        id: authUser.id,
        email: authUser.email ?? 'N/A',
        fullName:
          profile?.full_name ??
          ((authUser.user_metadata?.full_name as string | undefined) ?? null),
        role: normalizedRole as ManagedUser['role'],
        rawRole: profileRole,
        createdAt: authUser.created_at ?? null
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  const dateFormatter = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-surface/70 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-white">User management</h1>
        <p className="text-sm text-subtle">
          Promote trusted collaborators to superusers or return them to standard user access. Self
          demotion is disabled to prevent lock-outs.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-subtle">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-subtle">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-subtle">
                Role
              </th>
              <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-subtle">
                Created
              </th>
              <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-subtle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {managedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-subtle">
                  No users found.
                </td>
              </tr>
            ) : null}
            {managedUsers.map((managedUser) => (
              <tr key={managedUser.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white">
                  {managedUser.fullName ?? 'N/A'}
                  {managedUser.rawRole === 'admin' ? (
                    <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                      legacy admin
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-subtle">{managedUser.email}</td>
                <td className="px-4 py-3 text-subtle">{managedUser.role}</td>
                <td className="px-4 py-3 text-subtle">
                  {managedUser.createdAt
                    ? dateFormatter.format(new Date(managedUser.createdAt))
                    : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <UserRoleForm
                    userId={managedUser.id}
                    initialRole={managedUser.role}
                    isSelf={managedUser.id === currentUser.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
