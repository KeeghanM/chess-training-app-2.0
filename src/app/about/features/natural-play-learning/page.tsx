import Heading from "~/app/components/_elements/heading";
import CtaRow from "~/app/components/_layouts/ctaRow";
import Hero from "~/app/components/_layouts/hero";
import ImageRowFull from "~/app/components/_layouts/imageRowFull";
import { TextWall } from "~/app/components/_layouts/textWall";

export default async function NaturalPlayLearningPage() {
  return (
    <>
      <Hero
        title={"Master Chess Openings with Natural Play Learning"}
        image={{
          src: "/images/hero.avif",
          alt: "Wooden Chess pieces on a chess board",
        }}
      >
        <Heading as={"h2"}>
          Welcome to a Revolutionary Chess Training Experience
        </Heading>
      </Hero>
      <ImageRowFull
        image={{
          src: "/images/hero.avif",
          alt: "Wooden Chess pieces on a chess board",
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
      </ImageRowFull>
      <ImageRowFull
        image={{
          src: "/images/hero.avif",
          alt: "Wooden Chess pieces on a chess board",
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
          re-learn moves. Once you master a move, it becomes a part of your
          gameplay. You'll play through your openings from the start, but if you
          recognize a position, you skip the basics. You naturally play what you
          know and focus on learning what you don't. It's efficient, effective,
          and engaging.
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
        cta={{ text: "Sign Up Now", link: "/auth/signin" }}
        background="light"
      >
        <p>Sign up now for free and start your journey to chess mastery.</p>
      </CtaRow>
    </>
  );
}
