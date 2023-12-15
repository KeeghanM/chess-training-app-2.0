import {
  RegisterLink,
  LoginLink,
} from '@kinde-oss/kinde-auth-nextjs/components'
import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'
import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'

export default async function SignIn() {
  const { user } = await getUserServer()

  if (user) redirect('/dashboard')

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <Heading as={'h1'}>Sign In or Register</Heading>
        <p>
          To get the most out of ChessTraining.app, and to access all of our
          features, please sign in or register. Registration is{' '}
          <span className="text-orange-500">completely free</span>, and you'll
          get access to every single one of our Science Backed training tools
          forever.
        </p>
        <div className="flex flex-col gap-4 md:flex-row">
          <LoginLink postLoginRedirectURL="/dashboard">
            <Button variant="primary">Sign in</Button>
          </LoginLink>
          <RegisterLink postLoginRedirectURL="/dashboard/new">
            <Button variant="accent">Register</Button>
          </RegisterLink>
        </div>
      </div>
    </Container>
  )
}
