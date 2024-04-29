import Heading from '@/app/components/_elements/heading';
import StyledLink from '@/app/components/_elements/styled-link';
import CtaRow from '@/app/components/_layouts/cta-row';
import Hero from '@/app/components/_layouts/hero';
import ImageRowFull from '@/app/components/_layouts/image-row-full';

export const metadata = {
  title:
    'Enhance Your Chess Endgame Skills with Endgame Trainer at ChessTraining.app',
  description:
    "Discover the key to mastering chess endgames with the Endgame Trainer feature on ChessTraining.app. Whether you're tackling queen, rook, knight, bishop, or pawn endgames, our tailored training tool guides you through each scenario with precision. Designed for chess enthusiasts of all levels, our Endgame Trainer sharpens your skills for those crucial final moments of the game. Dive into our comprehensive training and turn endgame challenges into your strategic advantage",
};

export function Endgames() {
  return (
    <>
      <Hero
        title="Endgame Training"
        cta={{
          text: 'Start Training',
          link: '/training/endgames/train',
        }}
        image={{
          src: '/images/hero.avif',
          alt: 'Strategic chess endgame setup on a chess board',
        }}
      >
        <Heading as="h2" color="text-orange-500">
          Master your endgame strategy with ChessTraining.app&apos;s Endgame
          Trainer.
        </Heading>
      </Hero>
      <ImageRowFull
        background="light"
        heading="Understanding Chess Endgames"
        imageSide="left"
        image={{
          src: '/images/man_chess_1.png',
          alt: 'A player deeply focused on a chess endgame scenario',
        }}
      >
        <p>
          Endgames are crucial in chess, where the game&apos;s fate often hangs
          in the balance. Our Endgame Trainer provides you with scenarios that
          are both challenging and instructive, covering queen, rook, knight,
          bishop, and pawn endgames.
        </p>
        <p>
          The training is designed to improve your precision and decision-making
          in these vital stages of the game. By practicing different endgame
          scenarios, you develop an intuitive understanding and strategic depth.
        </p>
        <p>
          Our approach isn&apos;t just about learning moves; it&apos;s about
          developing a deep strategic understanding of endgame principles.
        </p>
      </ImageRowFull>
      <ImageRowFull
        background="light"
        heading="How to Use the Endgame Trainer"
        imageSide="right"
        image={{
          src: '/images/woman_chess_4.png',
          alt: 'A chess enthusiast analyzing endgame strategies',
        }}
      >
        <p>
          You can choose between queen, rook, knight, bishop, and pawn endgames.
          You can also select the difficulty level, ranging from beginner to
          master. The training will then provide you with a series of endgame
          scenarios to solve.
        </p>
        <p>
          In a similar way to our{' '}
          <StyledLink href="/training/tactics">Tactics Trainer</StyledLink>, you
          are presented with a chess position and then must solve it. You only
          have one chance to make the correct move, so think carefully before
          you make your choice. If you get it wrong, you can study the correct
          solution before moving on to the next position.
        </p>
      </ImageRowFull>
      <CtaRow
        background="dark"
        title="Are You Ready to Master Chess Endgames?"
        cta={{
          text: 'Start Your Endgame Mastery',
          link: '/training/endgames/train',
        }}
      >
        <p>
          The endgame trainer is free to use for all ChessTraining.app members.
          No credit card required.
        </p>
      </CtaRow>
    </>
  );
}
