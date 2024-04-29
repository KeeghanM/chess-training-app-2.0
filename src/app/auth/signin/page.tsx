import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/getUserServer';

export async function SignIn() {
  const { user } = await getUserServer();

  if (user) redirect('/dashboard');
  else redirect(`/api/auth/login?post_login_redirect_url=/dashboard`);
}
