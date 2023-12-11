import Button from "../components/_elements/button";
import Heading from "../components/_elements/heading";
import CtaRow from "../components/_layouts/ctaRow";
import Hero from "../components/_layouts/hero";
import ImageRowFull from "../components/_layouts/imageRowFull";
import { TextWall } from "../components/_layouts/textWall";

// TODO: Signup form
export default async function Courses() {
  return (
    <>
      <Hero
        title="Study courses with Natural Play Learning"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        cta={{
          text: "Start Training",
          link: "/training/tactics/list",
        }}
      >
        <Heading as="h2">
          The best way to improve your Chess Openings and beyond
        </Heading>
      </Hero>
      <ImageRowFull
        heading="What are courses?"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        imageSide="left"
      >
        <p>
          Courses are how we recommend training and improving your openings in
          chess. Using spaced repetition and our Natural Play Learning
          technique, we'll help you learn and remember your openings faster than
          ever before.
        </p>
        <p>
          We're currently working on our first course, but you can check out our
          Tactics Trainer below or keep reading to learn more about our Natural
          Play Learning technique.
        </p>
      </ImageRowFull>
      <a id="natural-play-learning" className="anchor" />
      <ImageRowFull
        heading="Natural Play Learning"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
        imageSide="right"
      >
        <p>
          Natural Play Learning is a technique we've developed to help you learn
          chess openings faster and remember them for longer. It's based on
          Spaced Repetition but with a twist.
        </p>
        <p>
          Instead of having to re-learn the same moves over and over again,
          instead once you get a move right, we'll only ever prompt you for it.
        </p>
        <p>
          This means you always play through your openings from the beginning,
          but if you've ever seen a position before you won't have to spend the
          time reading or click through the moves again. Instead, you Naturally
          Play the moves you know and learn the ones you don't.
        </p>
      </ImageRowFull>
      <CtaRow
        title="Check out our tactics trainer"
        cta={{
          text: "Check it out",
          link: "/training/tactics",
        }}
        background="dark"
      >
        <p>
          While we don't have our courses ready just yet, we do have our
          fantastic Tactics Trainer based on the WoodPecker Method.
        </p>
      </CtaRow>
      <CtaRow
        title="Sounds great, how do I get started?"
        background="light"
        cta={{
          text: "View our roadmap",
          link: "/product-roadmap",
        }}
      >
        <div className="flex flex-col gap-2">
          <p>
            Sadly we don't have the course trainer ready just yet, but we're
            close! If you want to be the first to know when it's ready, checkout
            our Product Roadmap below and subscribe to updates.
          </p>
          <p className="italic">
            P.s You can also see all our other upcoming feature releases.
          </p>
        </div>
      </CtaRow>
    </>
  );
}
