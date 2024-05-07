import { CtaRow } from '@/app/components/_layouts/cta-row';
import { PageHeader } from '@/app/components/_layouts/page-header';

export const metadata = {
  title:
    'Play the Masters - Improve your chess understanding at ChessTraining.app',
  description:
    'Play through the games of the masters, and try to guess their moves. A great way to improve your understanding of the game, and to learn new ideas. We have a large library of curated master games, all selected for their instructive value.',
};

export function PlayMastersPage() {
  return (
    <>
      <PageHeader
        subTitle="Coming soon!"
        title="Play the Masters"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <CtaRow
        background="light"
        title="Curious?"
        cta={{
          text: 'View our roadmap',
          link: '/product-roadmap',
        }}
      >
        <div className="flex flex-col gap-2">
          <p>
            We&apos;re working hard to bring you this feature as soon as
            possible. If you want to know more about our upcoming features,
            check out our roadmap.
          </p>
          <p className="italic">
            P.s You can also see all our other upcoming feature releases.
          </p>
        </div>
      </CtaRow>
    </>
  );
}
