import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

import CuratedSetsBrowser from '@/app/components/admin/curatedSets/curated-sets-browser';
import { prisma } from '@/server/db';

export async function CuratedSetsPage() {
  const { getUser, getPermissions } = getKindeServerSession();
  const user = await getUser();
  if (!user) redirect('/auth/signin');
  const permissions = await getPermissions();
  if (!permissions?.permissions.includes('staff-member'))
    redirect('/dashboard');

  const sets = await prisma.curatedSet.findMany();

  return (
    <div className="dark:bg-slate-800">
      <CuratedSetsBrowser sets={sets} />
    </div>
  );
}
