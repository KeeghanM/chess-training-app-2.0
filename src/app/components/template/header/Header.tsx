import Nav from './Nav'
import { getUserServer } from '~/app/_util/getUserServer'
import { PostHogClient } from '~/app/_util/trackEventOnServer'
import getDistinctId from '~/app/_util/getDistinctId'
import NewNav from './NewNav'

export default async function Header() {
  const { user, profile } = await getUserServer()
  const posthog = PostHogClient()
  const experimentFlagValue = await posthog.getFeatureFlag(
    'new-menu',
    await getDistinctId(),
  )

  return experimentFlagValue === 'new' ||
    process.env.NODE_ENV === 'development' ? (
    <NewNav user={user} experience={profile?.experience ?? 0} />
  ) : (
    <Nav user={user} />
  )
}
