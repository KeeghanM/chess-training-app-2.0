'use client';

import type { Course, UserCourse } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import trackEventOnClient from '@/app/_util/track-event-on-client';
import type { ResponseJson } from '@/app/api/responses';
import { Button } from '@/app/components/_elements/button';
import { StyledLink } from '@/app/components/_elements/styled-link';
import PremiumSubscribe from '@/app/components/ecomm/PremiumSubscribe';
import Spinner from '@/app/components/general/Spinner';
import TimeSince from '@/app/components/general/TimeSince';

import CourseSettings from './CourseSettings';
import type { PrismaUserCourse } from './CoursesList';

// TODO: Add revision schedule viewer

export function CourseListItem(props: {
  courseId: string;
  courseName: string;
  update: () => void;
  hasPremium: boolean;
}) {
  const router = useRouter();
  const [userCourse, setUserCourse] = useState<PrismaUserCourse | null>(null);
  const [nextReview, setNextReview] = useState<Date | null>(null);
  const [conicGradient, setConicGradient] = useState('');
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  const openCourse = async (mode: 'learn' | 'revise') => {
    if (!userCourse) return;

    setOpening(true);
    trackEventOnClient('course_opened', {});
    router.push(
      `/training/courses/${
        userCourse.id
      }${mode === 'learn' ? '?mode=newOnly' : ''}`,
    );
  };

  useEffect(() => {
    setOpening(false);
    (async () => {
      try {
        const resp = await fetch(`/api/courses/user/${courseId}`);
        const json = (await resp.json()) as ResponseJson;
        if (json.message !== 'Course Fetched')
          throw new Error('Course not fetched');

        const course = json.data!.course as PrismaUserCourse;

        setUserCourse(course);
        setConicGradient(GenerateConicGradient(course));
        if (json.data!.nextReview) {
          setNextReview(new Date(json.data!.nextReview as string));
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    })()
      .catch((e) => Sentry.captureException(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      key={courseId}
      className="flex flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900"
    >
      {loading ? (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex flex-col items-start justify-between gap-1 border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600 md:flex-row">
            <p className="flex flex-col gap-1">
              <span className="text-lg text-orange-500">Loading...</span>
              <span className="text-xs italic text-gray-600 dark:text-gray-400">
                Loading...
              </span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-300 dark:bg-slate-700" />
            </div>
            <div className="flex flex-col gap-2 md:ml-auto md:flex-row">
              <Button disabled variant="primary">
                <Spinner />
              </Button>
              <Button disabled variant="secondary">
                <Spinner />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-start justify-between gap-1 border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600 md:flex-row">
            <p className="flex flex-col gap-1">
              <Tippy content="View lines and other stats">
                <Link
                  className="cursor-pointer text-lg text-orange-500"
                  href={`/training/courses/${userCourse?.id}/lines`}
                >
                  {courseName}
                </Link>
              </Tippy>
              <span className="text-xs italic text-gray-600 dark:text-gray-400">
                Last trained{' '}
                {userCourse?.lastTrained ? (
                  <TimeSince
                    date={new Date(userCourse.lastTrained)}
                    text="ago"
                  />
                ) : (
                  'never'
                )}
              </span>
            </p>
            <CourseSettings update={update} userCourse={userCourse!} />
          </div>
          <div className="flex flex-col items-center gap-2 p-2 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <Tippy
                className="text-base"
                content={
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-300">
                      {userCourse?.linesUnseen} lines unseen
                    </p>
                    <p className="text-green-500">
                      {userCourse?.linesLearned} lines learned
                    </p>
                    <p className="text-blue-600">
                      {userCourse?.linesLearning} lines learning
                    </p>
                    <p className="text-red-500">
                      {userCourse?.linesHard} lines hard
                    </p>
                  </div>
                }
              >
                <div
                  className="grid h-16 w-16 place-items-center rounded-full"
                  style={{
                    background: conicGradient,
                  }}
                >
                  <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-slate-700" />
                </div>
              </Tippy>
              <Tippy
                disabled={Boolean(userCourse?.lines?.length)}
                content={
                  nextReview ? (
                    <p>
                      Next review in <TimeSince date={nextReview} />
                    </p>
                  ) : null
                }
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm italic">
                    {
                      userCourse?.lines?.filter(
                        (line) => line.revisionDate !== null,
                      ).length
                    }{' '}
                    {userCourse?.lines?.length === 1
                      ? 'line to review.'
                      : 'lines to review.'}
                  </p>
                  <p className="text-sm italic">
                    {
                      userCourse?.lines?.filter(
                        (line) => line.revisionDate === null,
                      ).length
                    }{' '}
                    {userCourse?.lines?.length === 1
                      ? 'line to learn.'
                      : 'lines to learn.'}
                  </p>
                  {hasPremium ? (
                    <Link
                      className="text-xs text-purple-700 underline hover:no-underline dark:text-purple-400"
                      href={`/training/courses/${userCourse?.id}/schedule`}
                    >
                      Edit revision schedule
                    </Link>
                  ) : (
                    <PremiumSubscribe
                      title="View Revision Schedule"
                      trigger={
                        <p className="text-xs text-purple-700 underline hover:no-underline dark:text-purple-400">
                          Edit revision schedule
                        </p>
                      }
                    >
                      <p>
                        With premium, you can view and edit the revision
                        schedule, allowing you to bring forward the next review
                        date for lines you're struggling with. In the future, we
                        will also be adding the ability to customise the
                        revision schedule to your liking.
                      </p>
                      <p>
                        This is super useful if you're preparing for a
                        tournament or just want to revise everything.
                      </p>
                      <p className="rounded bg-green-200 p-4 font-bold">
                        It's only £2.99/month to upgrade to premium!{' '}
                        <StyledLink href="/premium">Learn more.</StyledLink>
                      </p>
                      <p>
                        In addition to this, you also get both unlimited tactics
                        sets and openings courses plus a <strong>5%</strong>{' '}
                        discount on all products.
                      </p>
                    </PremiumSubscribe>
                  )}
                </div>
              </Tippy>
            </div>
            <div className="flex flex-col gap-2 md:ml-auto md:flex-row">
              <Button
                disabled={userCourse?.lines?.length === 0 || opening}
                variant="primary"
                onClick={() => openCourse('revise')}
              >
                {opening ? (
                  <>
                    Opening... <Spinner />
                  </>
                ) : (
                  'Study Course'
                )}
              </Button>
              <Link href={`/training/courses/${userCourse?.id}/lines`}>
                <Button variant="secondary">View Lines</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GenerateConicGradient(course: UserCourse & { course: Course }) {
  const totalLines =
    course.linesLearned +
    course.linesLearning +
    course.linesHard +
    course.linesUnseen;

  const learnedPercent = Math.round((course.linesLearned / totalLines) * 100);
  const learningPercent = Math.round((course.linesLearning / totalLines) * 100);
  const hardPercent = Math.round((course.linesHard / totalLines) * 100);
  const unseenPercent = Math.round((course.linesUnseen / totalLines) * 100);
  const conicGradient = `conic-gradient(
            #4ade80 ${learnedPercent}%,
            #2563eb ${learnedPercent}% ${learnedPercent + learningPercent}%,
            #ff3030 ${learnedPercent + learningPercent}% ${
              learnedPercent + learningPercent + hardPercent
            }%,
            #6b21a8 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`;

  return conicGradient;
}
