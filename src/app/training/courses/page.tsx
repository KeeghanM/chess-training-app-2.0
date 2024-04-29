import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/getUserServer';
import Container from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import BetaMessage from '@/app/components/training/courses/BetaMessage';
import CourseList from '@/app/components/training/courses/list/CoursesList';

export const metadata = {
  title: 'Your Courses - ChessTraining.app',
};

export async function Courses() {
  const { user, isPremium } = await getUserServer();

  if (!user) redirect('/auth/signin');

  return (
    <>
      <PageHeader
        subTitle="Your Courses"
        title="Opening Courses"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <BetaMessage />
          <CourseList hasUnlimitedCourses={isPremium} />
        </Container>
      </div>
    </>
  );
}
