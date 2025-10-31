'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  initialUpdateRoleState,
  updateUserRoleAction,
  type UpdateRoleState
} from './actions';

type RoleOption = 'user' | 'superuser';

type UserRoleFormProps = {
  userId: string;
  initialRole: RoleOption;
  isSelf: boolean;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || pending}
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

export default function UserRoleForm({ userId, initialRole, isSelf }: UserRoleFormProps) {
  const [role, setRole] = useState<RoleOption>(initialRole);
  const [state, formAction] = useFormState<UpdateRoleState, FormData>(
    updateUserRoleAction,
    initialUpdateRoleState
  );

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const disableDemotion = useMemo(() => isSelf && role !== 'superuser', [isSelf, role]);

  return (
    <form className="flex items-center gap-3" action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        value={role}
        onChange={(event) => setRole(event.target.value as RoleOption)}
        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="user">user</option>
        <option value="superuser">superuser</option>
      </select>
      <SubmitButton disabled={disableDemotion} />
      {state.status === 'error' ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}
      {state.status === 'success' ? (
        <p className="text-sm text-emerald-400">Saved</p>
      ) : null}
      {disableDemotion ? (
        <p className="text-sm text-amber-300">Cannot demote yourself.</p>
      ) : null}
    </form>
  );
}
