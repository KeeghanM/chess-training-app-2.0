import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createUserProfile, getUserServer } from '~/app/_util/getUserServer'
import { trackEventOnServer } from '~/app/_util/trackEventOnServer'
import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import StyledLink from '~/app/components/_elements/styledLink'
import PageHeader from '~/app/components/_layouts/pageHeader'


export default async function NewUserWelcome() {
  const { user, profile } = await getUserServer()
  if (!user) redirect('/auth/signin')
  if (!profile) {
    await createUserProfile(user)
    await trackEventOnServer('new_user_registered', {})
  }

  return (
    <>
      <PageHeader
        subTitle="I hope you enjoy your time here."
        title="Welcome to ChessTraining.app!"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <Container>
        <div className="flex flex-col gap-4">
          <Link href="/dashboard">
            <Button variant="primary">Just take me to my dashboard</Button>
          </Link>
          <p>
            Hi! I'm Keeghan McGarry, the founder of{' '}
            <strong>ChessTraining.app</strong>. I'm a chess enthusiast and
            software engineer. I built this site to help people who, like me,
            want to improve their chess skills but have found other sites a
            little lacking.
          </p>
          <p>
            I aim for <strong>ChessTraining.app</strong> to be the single best
            place to train all elements of your chess. In theory, you'll be able
            to do everything except actually play chess (maybe one day?). I'm
            constantly working to improve the site and add new features. If you
            have any feedback, please don't hesitate to{' '}
            <StyledLink href="/contact">contact me</StyledLink>.
          </p>
          <Image
            alt="Keeghan McGarry"
            className="mx-auto"
            height={200}
            src="/images/keeghan.png"
            width={200}
          />
          <p>
            I really hope you enjoy your time here.
            <br />
            <span className="italic">
              Keeghan McGarry - Founder & Lead Developer
            </span>
          </p>
          <Link href="/dashboard">
            <Button variant="primary">Start Training!</Button>
          </Link>
        </div>
      </Container>
    </>
  )
}
