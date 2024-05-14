'use client';

import { parse as PGNParse } from '@mliebelt/pgn-parser';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

import { trackEventOnClient } from '@/app/_util/track-event-on-client';
import { Button } from '@/app/components/_elements/button';

import { ParsePGNtoLineData } from './parse/ParsePGNtoLineData';
import type { Line } from './parse/ParsePGNtoLineData';

export function PgnToLinesForm({
  finished,
  back,
}: {
  finished: (lines: Line[]) => void;
  back: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [string, setString] = useState<string>('');

  const handleError = (msg: string) => {
    setError(msg);
    setStatus('idle');
  };

  const validPGN = (string: string) => {
    try {
      PGNParse(string, { startRule: 'games' });
      return true;
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('Unknown error');

      setStatus('idle');
      return false;
    }
  };

  const parse = () => {
    setError(null);
    setStatus('loading');

    try {
      if (string === '') {
        handleError('PGN is empty');
        return;
      }
      if (!validPGN(string)) {
        handleError('Invalid PGN');
        return;
      }

      const lines = ParsePGNtoLineData(string);
      if (!lines) {
        handleError('Something went wrong');
        return;
      }

      trackEventOnClient('create_course_pgn_imported', {});
      finished(lines);
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('Unknown error');
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="dark:text-white">
        Copy and paste your PGN into the box below. You will have a choice later
        about how to group the lines, so feel free to paste either multiple
        PGNs, or a single one with all the lines and variations contained.
      </p>
      <textarea
        className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
        rows={10}
        value={string}
        placeholder={`[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Morphy Defense, Caro Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 {The start of the Ruy Lopez} a6 (3... Nf6 4. O-O Nxe4 5. Re1 Nd6 6. Nxe5) 4. Ba4 b5 (4... Nf6 5. O-O Be7 6. Re1) 5. Bb3 Nf6 6. O-O

[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Arkhangelsk Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 {The start of the Ruy Lopez} a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4 Rb8 (7... Bb7 8. d3 O-O 9. Nc3) 8. c3 d6 9. d4`}
        onChange={(e) => {
          setString(e.target.value);
          setError(null);
        }}
      />
      <div className="flex flex-col gap-2 md:flex-row">
        <Button
          disabled={status === 'loading'}
          variant="primary"
          onClick={parse}
        >
          Import
        </Button>
        <Button variant="secondary" onClick={back}>
          Go Back
        </Button>
      </div>
      {error ? (
        <p className="text-red-500">Something went wrong: {error}</p>
      ) : null}
    </div>
  );
}
