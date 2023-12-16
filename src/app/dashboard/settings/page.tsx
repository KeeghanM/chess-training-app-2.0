import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'

export default async function AccountSettingsPage() {
  const { user, profile } = await getUserServer()
  if (!user) redirect('/auth/signin')

  return (
    <div>
      <h1>Account Settings</h1>
      <p>Coming soon...</p>
    </div>
  )
}
