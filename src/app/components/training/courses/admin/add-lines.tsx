'use client';

import type { Course, Move } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useState } from 'react';

import { trackEventOnClient } from '@/app/_util/track-event-on-client';
import type { ResponseJson } from '@/app/api/responses';
import { Button } from '@/app/components/_elements/button';
import { Heading } from '@/app/components/_elements/heading';
import { StyledLink } from '@/app/components/_elements/styled-link';

import { GroupSelector } from '../create/group-selector';
import { PgnToLinesForm } from '../create/pgn-to-lines-form';
import type { Line } from '../create/parse/parse-pgn-to-line-data';

type FullCourseData = Course & {
  lines: (Line & { moves: Move[] })[];
};

export function AddLines({ courseId }: { courseId: string }) {
  const [step, setStep] = useState<'pgn' | 'groups' | 'error' | 'success'>(
    'pgn',
  );
  const [lines, setLines] = useState<Line[]>([]);

  const uploadLines = async (group: string, lines: Line[]) => {
    try {
      const cleanLines = lines.map((line) => ({
        groupName: line.tags[group],
        colour: line.tags.Colour,
        moves: line.moves,
      }));
      const allGroups = [...new Set(cleanLines.map((line) => line.groupName))];

      const resp = await fetch('/api/courses/create/addLines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          groupNames: allGroups,
          lines: cleanLines,
        }),
      });

      const json = (await resp.json()) as ResponseJson;

      if (json.message !== 'Lines added') throw new Error(json.message);

      trackEventOnClient('course_lines_added', {});
      setStep('success');
    } catch (e) {
      Sentry.captureException(e);
      setStep('error');
    }
  };

  const processLines = async (lines: Line[]) => {
    // Download existing data
    const lineResp = await fetch('/api/courses/create/getLines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId: courseId }),
    });
    const lineJson = (await lineResp.json()) as ResponseJson;

    if (lineJson.message !== 'Success') throw new Error(lineJson.message);

    const existingCourseData = lineJson.data?.course as FullCourseData;

    // Now filter out any lines that already exist
    setLines(
      lines.filter(
        (line) =>
          !existingCourseData.lines.some(
            (existingLine) =>
              // @ts-expect-error : Not sure why this is an error, it is expecting a CleanMove even though that's not the type being passed in.
              // eslint-disable-next-line -- See above
              existingLine.moves.map((move) => move.move).join('') ===
              line.moves.map((move) => move.notation).join(''),
          ),
      ),
    );
    setStep('groups');
  };

  return (
    <div className="bg-slate-900 p-4">
      {step === 'error' && (
        <>
          <Heading as="h2" color="text-red-500">
            Oops! Something went wrong
          </Heading>
          <p className="text-white">
            Please refresh and try again, or{' '}
            <StyledLink href="/contact/report-an-issue">
              report an issue
            </StyledLink>
            .
          </p>
        </>
      )}
      {step === 'pgn' && (
        <PgnToLinesForm
          back={() => {
            history.back();
          }}
          finished={async (lines) => {
            await processLines(lines);
          }}
        />
      )}
      {step === 'groups' && (
        <GroupSelector
          back={() => setStep('pgn')}
          finished={uploadLines}
          lines={lines}
          setLines={setLines}
        />
      )}
      {step === 'success' && (
        <div className="flex flex-col gap-2">
          <Heading as="h2" color="text-green-500">
            Success!
          </Heading>
          <p className="text-white">
            Your new lines were successfully added to the course.
          </p>
          <div className="flex gap-2">
            <Link href="/training/courses/">
              <Button variant="primary">Back to course list</Button>
            </Link>
            <Link href={`/training/courses/admin/${courseId}`}>
              <Button variant="warning">Back to admin page</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
