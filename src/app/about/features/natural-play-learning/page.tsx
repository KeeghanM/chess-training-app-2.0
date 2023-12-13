import Link from 'next/link'
import Heading from '~/app/components/_elements/heading'
import BigText from '~/app/components/_layouts/bigText'
import CtaRow from '~/app/components/_layouts/ctaRow'
import Hero from '~/app/components/_layouts/hero'
import ImageRowFull from '~/app/components/_layouts/imageRowFull'
import { TextWall } from '~/app/components/_layouts/textWall'

export const metadata = {
  title:
    'Revolutionize your Chess Training with Natural Play Learning - ChessTraining.app',
  description:
    "Discover ChessTraining.app's Natural Play Learning, an innovative chess training method for faster learning and longer retention. Master chess openings like never before with our unique approach, combining the effectiveness of spaced repetition with real-game scenarios. Join us now and elevate your chess game",
}

export default async function NaturalPlayLearningPage() {
  return (
    <>
      <Hero
        title={'Master Chess Openings with Natural Play Learning'}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden Chess pieces on a chess board',
        }}
      >
        <Heading as={'h2'}>
          Welcome to a Revolutionary Chess Training Experience
        </Heading>
      </Hero>
      <ImageRowFull
        image={{
          src: '/images/man_frustrated_3.png',
          alt: 'A man sat at a desk frustrated yet determined to improve his chess',
        }}
        imageSide="left"
        heading="Unlock Your Chess Potential"
        background="light"
      >
        <p>
          Welcome to ChessTraining.app, the home of innovative chess training.
          Our unique method, <strong>Natural Play Learning</strong> is designed
          to transform how you learn chess openings. It's not just learning;
          it's mastering chess in a way that sticks. Dive into a world where
          each move becomes a part of you!
        </p>
        <p>
          It doesn't matter if you're a beginner or a Grandmaster; our method
          works for everyone. Improving upon the old Spaced Repetition
          technique, and getting to the heart of what makes chess openings so
          challenging, we've created a method that's efficient, effective, and
          engaging.
        </p>
      </ImageRowFull>
      <BigText color="secondary">
        Start improving your chess now -{' '}
        <Link
          className="cursor-pointer font-bold !text-purple-500 underline hover:no-underline"
          href="/auth/signin"
        >
          Sign Up
        </Link>{' '}
        for free!
      </BigText>
      <ImageRowFull
        image={{
          src: '/images/man_chess_computer_3.png',
          alt: 'A person sat at a computer studying and improving their chess',
        }}
        imageSide="right"
        heading="What Is Natural Play Learning?"
        background="light"
      >
        <p>
          <strong>Natural Play Learning</strong> is our exclusive technique,
          revolutionizing chess training and chess improvement. Inspired by
          Spaced Repetition, it's more than just repeating moves. It's about
          understanding and remembering them. Here's the twist: you don't just
          re-learn moves.
        </p>
        <p>
          Once you master a move, it becomes a part of your gameplay. You'll
          play through your openings from the start, but if you recognize a
          position, you skip the basics. You naturally play what you know and
          focus on learning what you don't. It's efficient, effective, and
          engaging.
        </p>
        <p>
          <strong>Natural Play Learning</strong> is the future of chess
          training. It's the best way to learn chess openings, and it's
          exclusive to ChessTraining.app.
        </p>
      </ImageRowFull>
      <TextWall title="Why choose Natural Play Learning?" background="dark">
        <ul>
          <li>
            <strong>Faster Learning:</strong> Absorb chess openings quickly.
          </li>
          <li>
            <strong>Longer Retention:</strong> Remember moves for a more
            extended period.
          </li>
          <li>
            <strong>Efficient Training:</strong> Focus on new challenges, not
            what you already know.
          </li>
          <li>
            <strong>Real-Game Feel:</strong> Experience openings as they would
            occur in real games.
          </li>
        </ul>
      </TextWall>
      <CtaRow
        title="Ready to transform your chess game?"
        cta={{ text: 'Sign Up Now', link: '/auth/signin' }}
        background="light"
      >
        <p>Sign up now for free and start your journey to chess mastery.</p>
      </CtaRow>
    </>
  )
}
