import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/get-user-server';
import { Container } from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import VisualisationTrainer from '@/app/components/training/visualisation/VisualisationTrainer';

const VisualisationTrainPage = async () => {
  const { user } = await getUserServer();
  if (!user) redirect('/auth/signin');

  return (
    <>
      <PageHeader
        title="Visualisation Training"
        image={{
          src: '/images/hero.avif',
          alt: 'Strategic chess endgame setup on a chess board',
        }}
      />
      <div className="bg-gray-100 dark:bg-slate-800">
        <Container>
          <VisualisationTrainer />
        </Container>
      </div>
    </>
  );
};

export VisualisationTrainPage;
