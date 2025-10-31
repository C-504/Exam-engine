'use server';

import { revalidatePath } from 'next/cache';
import { assertSuperuser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export type UpdateRoleState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export const initialUpdateRoleState: UpdateRoleState = {
  status: 'idle'
};

const VALID_ROLES = new Set(['user', 'superuser']);

export async function updateUserRoleAction(
  _prevState: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  const { profile: currentProfile } = await assertSuperuser();

  const userId = formData.get('userId');
  const role = formData.get('role');

  if (typeof userId !== 'string' || userId.length === 0) {
    return {
      status: 'error',
      message: 'Missing user identifier.'
    };
  }

  if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
    return {
      status: 'error',
      message: 'Role must be user or superuser.'
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  if (currentProfile.id === userId && role !== 'superuser') {
    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['superuser', 'admin']);

    if (countError) {
      return {
        status: 'error',
        message: countError.message ?? 'Unable to verify superuser count.'
      };
    }

    if ((count ?? 0) <= 1) {
      return {
        status: 'error',
        message: 'You cannot demote the last superuser.'
      };
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (updateError) {
    return {
      status: 'error',
      message: updateError.message ?? 'Failed to update role.'
    };
  }

  await revalidatePath('/app/user-management');

  return {
    status: 'success',
    message: 'Role updated successfully.'
  };
}
