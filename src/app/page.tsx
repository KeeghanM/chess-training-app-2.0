import Link from "next/link";
import Button from "./components/_elements/button";
import Heading from "./components/_elements/heading";
import BigText from "./components/_layouts/bigText";
import CtaRow from "./components/_layouts/ctaRow";
import Hero from "./components/_layouts/hero";
import ImageRowFull from "./components/_layouts/imageRowFull";
import { MultiCol, MultiColItem } from "./components/_layouts/multiCol";

export default async function Home() {
  return (
    <>
      <Hero
        title="Elevate Your Chess Game - Where Every Move Counts!"
        cta={{
          text: "Start Training",
          link: "/auth/signin",
        }}
        image={{
          src: "/images/chessbackground.webp",
          alt: "Chess board with pieces set up",
        }}
      >
        <Heading as="h2">
          Join a thriving community of chess enthusiasts. Sign up now - it's
          free!
        </Heading>
      </Hero>
      <ImageRowFull
        heading="The definitive destination for chess enthusiasts of all skill levels"
        imageSide="left"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Chess board with pieces set up",
        }}
      >
        <p>
          Our mission is simple yet ambitious: to elevate your chess game
          through innovative, science-backed training methods. Whether you're
          taking your first steps on the chessboard or seeking to refine your
          grandmaster-level tactics, ChessTraining.app is tailored to your
          journey.
        </p>
        <p>
          Our platform combines the rigor of professional chess training with
          the warmth and accessibility of a global chess community, making
          learning both effective and enjoyable.
        </p>
        <div>
          <Link href="/about/features">
            <Button variant="primary">See all features</Button>
          </Link>
        </div>
      </ImageRowFull>
      <ImageRowFull
        heading="Introducing Natural Play Learning"
        imageSide="right"
        background="light"
        image={{
          src: "/images/hero.avif",
          alt: "Chess board with pieces set up",
        }}
      >
        <p>
          A groundbreaking approach exclusive to ChessTraining.app. This method
          revolutionizes the way you learn chess. Gone are the days of
          repetitive drills on positions you've already mastered. Our
          intelligent system adapts to your learning curve, focusing on new
          challenges and reinforcing concepts only as needed.
        </p>
        <p>
          This mirrors real-game scenarios, preparing you for diverse and
          unexpected plays. With Natural Play Learning, experience a more
          intuitive, efficient, and enjoyable path to chess mastery. Join us
          today and discover the ChessTraining.app difference.
        </p>
        <div>
          <Link href="/courses#natural-play-learning">
            <Button variant="primary">Learn More</Button>
          </Link>
        </div>
      </ImageRowFull>
      <BigText color="accent">
        From our flagship Tactics Trainer to innovative "Natural Play Learning"
        courses, each tool is designed to target specific areas of your game.
      </BigText>
      <MultiCol title="Our Training Tools" background="light">
        <MultiColItem title="Tactics Trainer">
          <p>
            Train tactics using the WoodPecker Method developed by GM's Axel
            Smith, and Hans Tikkanen.
          </p>
          <p>
            Re-program your unconscious mind. With benefits including sharper
            tactical vision, fewer blunders, and better play when in time
            trouble as well as improved intuition.
          </p>
          <p>
            Generate puzzle sets and train on them, while the site takes care of
            tracking your accuracy & time spent.
          </p>
          <Link href="/training/puzzles">
            <Button variant="primary">Start Training</Button>
          </Link>
        </MultiColItem>
        <MultiColItem title="Course Trainer">
          <p>
            Built using spaced repetition, and implementing our Natural Play
            Learning method, our courses are a great way to learn.
          </p>
          <p>
            Train using a course you have created, or one that has been shared
            with you. You won't find a better way to learn chess.
          </p>
          <Link href="/courses">
            <Button variant="primary">Browse Courses</Button>
          </Link>
        </MultiColItem>
        <MultiColItem title="Endgame Trainer">
          <p>
            Fundamental to the game of chess, endgames are an area of chess
            which many players neglect in their training.
          </p>
          <p>
            Not as exciting as openings, not as sexy as middlegame tactics, but
            arguably much more important than either.
          </p>
          <p>
            Pick from Queen, Rook, Knight, Bishop, or Pawn endgames. Or let fate
            decide.
          </p>
          <Link href="/training/endgames">
            <Button variant="primary">Let's Go</Button>
          </Link>
        </MultiColItem>
      </MultiCol>
      <CtaRow
        title="Ready to transform your chess game?"
        cta={{ text: "Sign Up", link: "/auth/signin" }}
        background="dark"
      >
        <p>Sign up now for free and start your journey to chess mastery.</p>
      </CtaRow>
      <MultiCol title="Customer Testimonials" background="light">
        <MultiColItem title="NM Roger Williamson">
          <p>
            "I've been playing chess for 20 years and have always struggled with
            tactics. I've tried everything, but nothing has worked as well as
            ChessTraining.app. I've seen a dramatic improvement in my game since
            I started using it."
          </p>
        </MultiColItem>
        <MultiColItem title="Dr. Gaby Titley-Wilson">
          <p>
            "I'm a beginner and have always been intimidated by chess. I
            recently started using ChessTraining.app and have been blown away by
            how easy it is to use. I'm learning so much and having a blast doing
            it!"
          </p>
        </MultiColItem>
        <MultiColItem title="Keeghan McGarry">
          <p>
            "Having tried a lot of different chess improvement websites, I can
            say that ChessTraining.app is the best. The tactics trainer is
            great, and the courses are really helpful. I've seen a big
            improvement in my game since I started using it."
          </p>
        </MultiColItem>
      </MultiCol>
    </>
  );
}
