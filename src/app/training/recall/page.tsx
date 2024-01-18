import CtaRow from '~/app/components/_layouts/ctaRow'
import PageHeader from '~/app/components/_layouts/pageHeader'

export const metadata = {
  title: 'Recall Training - Advance Your Chess Strategy at ChessTraining.app',
  description:
    "Improve your board vision, and memory skills with ChessTraining.app's Recall training. Designed to test your memory and understanding of the board and it's pieces. Perfect for those looking to elevate their game to the next level.",
}

export default async function RecallPage() {
  return (
    <>
      <PageHeader
        title="Recall Training"
        subTitle="Coming soon!"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
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
