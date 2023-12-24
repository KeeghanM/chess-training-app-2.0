import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'
import Container from '~/app/components/_elements/container'
import AccountForm from '~/app/components/dashboard/AccountForm'

export default async function AccountSettingsPage() {
  const { user, profile } = await getUserServer()
  if (!user) redirect('/auth/signin')
  if (!profile) redirect('/dashboard/new')

  return (
    <Container>
      <AccountForm profile={profile} />
    </Container>
  )
}
