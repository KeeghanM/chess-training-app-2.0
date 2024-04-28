'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';
import { env } from '@/env';
import * as Sentry from '@sentry/nextjs';
import 'tippy.js/dist/tippy.css';

import Button from '@/app/components/_elements/button';
import Spinner from '@/app/components/general/Spinner';

import type { PrismaUserCourse } from './CoursesList';

export default function ArchivedList(props: { hasUnlimitedCourses: boolean }) {
  const [courses, setCourses] = useState<PrismaUserCourse[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const { hasUnlimitedCourses } = props;
  const maxCourses = env.NEXT_PUBLIC_MAX_COURSES;

  const fetchCourses = async () => {
    setLoading(true);
    setCourses([]);
    try {
      const resp = await fetch(`/api/courses/user/archived`);
      const json = (await resp.json()) as ResponseJson;
      if (json?.message != 'Courses found')
        throw new Error('Failed to fetch courses');

      setCourses(json.data!.courses as PrismaUserCourse[]);
      setActiveCount(json.data!.activeCount as number);
    } catch (e) {
      Sentry.captureException(e);
      setCourses([]);
    }
    setLoading(false);
  };

  const restoreCourse = async (courseId: string) => {
    setRestoring(true);
    try {
      const resp = await fetch(`/api/courses/user/${courseId}/restore`, {
        method: 'POST',
      });
      const json = (await resp.json()) as ResponseJson;
      if (json?.message != 'Course restored')
        throw new Error('Failed to restore course');
      await fetchCourses();
    } catch (e) {
      Sentry.captureException(e);
    }
    setRestoring(false);
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
      <div className="w-full">
        <Link
          className="text-sm text-purple-700 underline hover:text-purple-600 md:ml-auto"
          href="/training/courses"
        >
          View active courses
        </Link>
      </div>
      {loading ? (
        <div className="relative flex h-16 w-full items-center justify-center dark:text-white">
          <div className="absolute inset-0 bg-gray-500 opacity-30" />
          <p className="flex items-center gap-4">
            Loading... <Spinner />
          </p>
        </div>
      ) : (
        <div
          className={`flex flex-col gap-4 ${
            courses.length == 0 ? ' bg-gray-100 dark:bg-slate-900' : ''
          }`}
        >
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center gap-4 bg-gray-100 p-2 dark:bg-slate-900  dark:text-white md:flex-row md:justify-between md:px-6"
              >
                <p>{course.course.courseName}</p>

                <Button
                  variant="primary"
                  disabled={
                    (activeCount >= maxCourses && !hasUnlimitedCourses) ||
                    restoring
                  }
                  onClick={() => restoreCourse(course.id)}
                >
                  {restoring ? (
                    <>
                      Restoring... <Spinner />
                    </>
                  ) : (
                    'Restore'
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="p-2">
              <p className="text-gray-500  dark:text-white">
                You don't have any archived courses.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
