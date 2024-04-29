import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/getUserServer';
import Container from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import EndgameTrainer from '@/app/components/training/endgames/EndgameTrainer';

export async function EndgameTrainPage() {
  const { user } = await getUserServer();
  if (!user) redirect('/auth/signin');

  return (
    <>
      <PageHeader
        title="Endgame Training"
        image={{
          src: '/images/hero.avif',
          alt: 'Strategic chess endgame setup on a chess board',
        }}
      />
      <div className="bg-gray-100 dark:bg-slate-800">
        <Container>
          <EndgameTrainer />
        </Container>
      </div>
    </>
  );
}
