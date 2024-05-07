import { getUserServer } from '@/app/_util/get-user-server';

import Nav from './Nav';

export async function Header() {
  const { user, profile } = await getUserServer();

  return <Nav experience={profile?.experience ?? 0} user={user} />;
}
