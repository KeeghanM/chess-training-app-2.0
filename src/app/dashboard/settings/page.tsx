import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/getUserServer';
import Container from '@/app/components/_elements/container';
import AccountForm from '@/app/components/dashboard/AccountForm';

export async function AccountSettingsPage() {
  const { user, profile } = await getUserServer();
  if (!user) redirect('/auth/signin');
  if (!profile) redirect('/dashboard/new');

  return (
    <div className="dark:bg-slate-800">
      <Container>
        <AccountForm profile={profile} />
      </Container>
    </div>
  );
}
