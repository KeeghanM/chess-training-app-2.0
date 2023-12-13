import CtaRow from '~/app/components/_layouts/ctaRow'
import PageHeader from '~/app/components/_layouts/pageHeader'

export const metadata = {
  title:
    'Enhance Your Chess Endgame Skills with Endgame Trainer at ChessTraining.app',
  description:
    "Discover the key to mastering chess endgames with the Endgame Trainer feature on ChessTraining.app. Whether you're tackling queen, rook, knight, bishop, or pawn endgames, our tailored training tool guides you through each scenario with precision. Designed for chess enthusiasts of all levels, our Endgame Trainer sharpens your skills for those crucial final moments of the game. Dive into our comprehensive training and turn endgame challenges into your strategic advantage",
}

export default function Endgames() {
  return (
    <>
      <PageHeader
        title="Endgame Training"
        subTitle="Coming soon!"
        image={{
          src: '/images/hero.avif',
          alt: 'Hero Image',
        }}
      />
      <CtaRow
        title="Curious?"
        background="light"
        cta={{
          text: 'View our roadmap',
          link: '/product-roadmap',
        }}
      >
        <div className="flex flex-col gap-2">
          <p>
            We're working hard to bring you this feature as soon as possible. If
            you want to know more about our upcoming features, check out our
            roadmap.
          </p>
          <p className="italic">
            P.s You can also see all our other upcoming feature releases.
          </p>
        </div>
      </CtaRow>
    </>
  )
}
