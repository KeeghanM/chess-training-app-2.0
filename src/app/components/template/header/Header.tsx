import Nav from './Nav'

import { getUserServer } from '~/app/_util/getUserServer'


export default async function Header() {
  const { user, profile } = await getUserServer()

  return <Nav experience={profile?.experience ?? 0} user={user} />
}
