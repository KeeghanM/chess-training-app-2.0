import CtaRow from "~/app/components/_layouts/ctaRow";
import Hero from "~/app/components/_layouts/hero";
import ImageRowFull from "~/app/components/_layouts/imageRowFull";

export default async function Tactics() {
  return (
    <>
      <Hero
        title="Tactics Training"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        cta={{
          text: "Start Training",
          link: "/training/tactics/list",
        }}
        secondary={{
          text: "Learn More",
          link: "#about",
        }}
      >
        <p>
          Train tactics using the WoodPecker Method developed by GM's Axel
          Smith, and Hans Tikkanen.
        </p>
      </Hero>
      <ImageRowFull
        heading="What is the Woodpecker Method"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        imageSide="left"
      >
        <a id="about" />
        <p>
          The Woodpecker Method is based on solving a large set of puzzles; then
          solving the same puzzles again and again, only faster.
        </p>
        <p>
          The puzzles should be difficult but not impossible, in the 3-7 minute
          range to solve. Not 30 seconds. By repeating the set over and over,
          you will get faster and more accurate.
        </p>
        <p>
          However this isn't simple memorisation! Rather, you internalise and
          bake into your subconscious the core ideas and patterns.
        </p>
      </ImageRowFull>
      <ImageRowFull
        heading="How to use the Puzzle Trainer"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        imageSide="right"
      >
        <p>
          Using the Puzzle Trainer, you can build a set of between 200-500
          puzzles. Each one tailored to your chess rating. We will automatically
          track the time spent on each puzzle, and the overall set. As well as
          your accuracy throughout your training.
        </p>
        <p>
          This means all the admin work required in the WoodPecker method of
          tracking your work is taken care of for you - you just focus on
          solving puzzles. Remember, these puzzles should be difficult to solve.
          For best results, break your practice into 30-60 minute sessions once
          a day. Your first time through a puzzle set should take 1-2 weeks.
        </p>
      </ImageRowFull>
      <CtaRow
        title="Ready to take your game to the next level?"
        cta={{
          text: "Start Training",
          link: "/training/tactics/list",
        }}
        background="dark"
      >
        <p>Create up to three puzzles sets for free. No costs. Forever.</p>
      </CtaRow>
    </>
  );
}
