'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';
import type { Course, UserCourse, UserLine } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

import Button from '@/app/components/_elements/button';
import Heading from '@/app/components/_elements/heading';
import StyledLink from '@/app/components/_elements/styledLink';
import Spinner from '@/app/components/general/Spinner';

import PremiumSubscribe from '../../../ecomm/PremiumSubscribe';
import CourseListItem from './CourseListItem';

export type PrismaUserCourse = UserCourse & {
  course: Course;
} & {
  lines?: UserLine[];
};

export default function CourseList(props: { hasUnlimitedCourses: boolean }) {
  const [courses, setCourses] = useState<PrismaUserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasUnlimitedCourses } = props;
  const maxCourses = 2;

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/courses/user/active`);
      const data = (await resp.json()) as ResponseJson;
      if (data?.message != 'Courses found')
        throw new Error('Failed to fetch courses');

      setCourses(data.data!.courses as PrismaUserCourse[]);
    } catch (e) {
      Sentry.captureException(e);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCourses();
    })().catch((e) => {
      Sentry.captureException(e);
    });
  }, []);

  return (
    <>
      <div className="mb-2 flex flex-col items-center gap-2 md:flex-row">
        {courses.length < maxCourses || hasUnlimitedCourses ? (
          <Link href="/courses/create">
            <Button variant="primary">
              Create New Course
              <svg
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </Link>
        ) : (
          <PremiumSubscribe
            title="Create a new course"
            trigger={
              <Button variant="primary">
                Create New Course
                <svg
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            }
          >
            <p>
              You have reached the maximum number of courses ({maxCourses}) you
              can create as a free user.
            </p>
            <p className="italic">
              Either delete/archive some of your existing courses or upgrade to
              premium.
            </p>
            <p className="rounded bg-green-200 p-4 font-bold">
              It's only £2.99/month to upgrade to premium!{' '}
              <StyledLink href="/premium">Learn more.</StyledLink>
            </p>
            <p>
              You get both unlimited tactics sets and openings courses plus a{' '}
              <strong>5%</strong> discount on all products.
            </p>
          </PremiumSubscribe>
        )}

        <Link href="/courses">
          <Button variant="secondary">Browse Courses</Button>
        </Link>
        <Link
          className="text-sm text-purple-700 underline hover:text-purple-600 dark:text-purple-400 md:ml-auto"
          href="/training/courses/archived"
        >
          View archived courses
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <div className="flex h-24 flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] opacity-50 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900">
              <p className="m-auto flex w-fit gap-1">
                Loading... <Spinner />
              </p>
            </div>
            <div className="flex h-24 flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] opacity-50 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white  dark:shadow-slate-900">
              <p className="m-auto flex w-fit gap-1">
                Loading... <Spinner />
              </p>
            </div>
          </>
        ) : courses.length > 0 ? (
          courses
            .sort(
              (a, b) =>
                (b.active ? 1 : 0) - (a.active ? 1 : 0) ||
                (a.lastTrained === null ? 0 : 1) -
                  (b.lastTrained === null ? 0 : 1) ||
                (b.lastTrained ? new Date(b.lastTrained).getTime() : 0) -
                  (a.lastTrained ? new Date(a.lastTrained).getTime() : 0),
            )
            .map((course, index) => (
              <CourseListItem
                key={index}
                courseId={course.id}
                courseName={course.course.courseName}
                hasPremium={hasUnlimitedCourses}
                update={fetchCourses}
              />
            ))
        ) : (
          <div className="bg-gray-100 p-2 dark:bg-slate-900">
            <Heading as="h3">You haven't got any courses yet</Heading>
            <p className="text-gray-500  dark:text-white">
              You can browse any of our{' '}
              <StyledLink href="/courses">amazing courses</StyledLink> or try{' '}
              <StyledLink href="/courses/create">creating your own</StyledLink>.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
