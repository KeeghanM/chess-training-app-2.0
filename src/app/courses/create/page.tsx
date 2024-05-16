import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/get-user-server';
import { PageHeader } from '@/app/components/_layouts/page-header';
import { CreateCourseForm } from '@/app/components/training/courses/create/create-course';

export const metadata = {
  title: 'Create a new course - ChessTraining.app',
};

export default async function CreateCourse() {
  const { user } = await getUserServer();
  if (!user) redirect('/auth/signin');

  return (
    <>
      <PageHeader
        title="Create a new course"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <CreateCourseForm />
    </>
  );
}
