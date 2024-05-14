'use client';

import { useState } from 'react';

export function Info() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 flex flex-col gap-1 dark:text-white">
      {open ? (
        <div className="flex flex-col gap-4">
          <p>
            Here you can see which lines are due when. The order shown on this
            page is the order in which you&apos;ll be shown them in the course
            trainer.
          </p>
          <p>
            If you want to review a line or group of lines sooner than
            scheduled, you can mark them for review. This will reset their
            revision date to the earliest date in the schedule, meaning
            you&apos;ll see them first.
          </p>
          <p>
            If you want to review all lines, even ones with dates far in the
            future or ones you&apos;ve not yet seen, you can click &quot;Mark
            All Lines For Review&quot;, which will set all lines to be reviewed
            immediately.
          </p>
          <p>
            This is a particularly useful feature if you need to prep for a
            tournament, or if you&apos;re going on holiday and want to get some
            extra training in before you go.
          </p>
          <div>
            <button
              className="text-purple-700 underline hover:no-underline dark:text-purple-300"
              onClick={() => setOpen(false)}
            >
              Read Less
            </button>
          </div>
        </div>
      ) : (
        <>
          <p>
            Here you can see which lines are due when. The order shown on this
            page is the order in which you&apos;ll be shown them in the course
            trainer.
          </p>
          <div>
            <button
              className="text-purple-700 underline hover:no-underline dark:text-purple-300"
              onClick={() => setOpen(true)}
            >
              Read More
            </button>
          </div>
        </>
      )}
    </div>
  );
}
