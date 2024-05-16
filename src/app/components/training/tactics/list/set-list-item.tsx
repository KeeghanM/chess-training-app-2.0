'use client';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import toHHMMSS from '@/app/_util/to-hhmmss';
import trackEventOnClient from '@/app/_util/track-event-on-client';
import { Button } from '@/app/components/_elements/button';
import Spinner from '@/app/components/general/spinner';
import TimeSince from '@/app/components/general/time-since';
import type { PrismaTacticsSet } from '@/app/components/training/tactics/create/TacticsSetCreator';

import SetListEdit from './set-list-edit';
import { SetListStats } from './set-list-stats';

export function SetListItem(props: {
  set: PrismaTacticsSet;
  updated: () => void;
}) {
  const { set } = props;
  const { user } = useKindeBrowserClient();
  const currentRound = set.rounds[set.rounds.length - 1];
  const completedCount =
    (currentRound?.correct ?? 0) + (currentRound?.incorrect ?? 0);
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const trainSet = () => {
    setOpening(true);
    trackEventOnClient('tactics_set_opened', {});
    router.push(`/training/tactics/${set.id}`);
  };

  useEffect(() => {
    setOpening(false);
  }, []);

  return (
    <div
      key={set.id}
      className="flex flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900"
    >
      <div className="border-b border-gray-300 px-2 py-1 font-bold text-orange-500 dark:border-slate-600">
        <button className="cursor-pointer" onClick={trainSet}>
          <span className="text-lg">{set.name}</span>
          <span className="px-2 text-xs italic text-gray-600 dark:text-gray-400">
            Last trained{' '}
            {set.lastTrained ? (
              <TimeSince date={new Date(set.lastTrained)} text="ago" />
            ) : (
              'never'
            )}
          </span>
        </button>
      </div>

      <div className="flex w-full flex-col gap-2 p-2">
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex flex-col items-center border border-gray-300 dark:border-slate-600">
            <p className="border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600">
              Round
            </p>
            <p>{set.rounds.length}/8</p>
          </div>
          <div className="flex flex-col items-center border border-gray-300 dark:border-slate-600">
            <p className="border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600">
              Completed
            </p>
            <p>
              {completedCount}/{set.size}
            </p>
          </div>
          <div className="flex flex-col items-center border border-gray-300 dark:border-slate-600">
            <p className="border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600">
              Accuracy
            </p>
            <p>
              {currentRound && currentRound.correct + currentRound.incorrect > 0
                ? Math.round(
                    (currentRound.correct /
                      (currentRound.correct + currentRound.incorrect)) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
          <div className="flex flex-col items-center border border-gray-300 dark:border-slate-600">
            <p className="border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600">
              Time Spent
            </p>
            <p>{toHHMMSS(currentRound?.timeSpent ?? 0)}</p>
          </div>
          {set.rating ? (
            <div className="flex flex-col items-center border border-gray-300 dark:border-slate-600">
              <p className="border-b border-gray-300 px-2 py-1 font-bold dark:border-slate-600">
                Rating
              </p>
              <p>{set.rating}</p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-center">
          <Button
            variant="primary"
            disabled={
              (set.rounds.length >= 8 && completedCount >= set.size) || opening
            }
            onClick={trainSet}
          >
            {opening ? (
              <>
                Opening... <Spinner />
              </>
            ) : (
              'Train'
            )}
          </Button>
          <SetListEdit set={set} user={user} onFinished={updated} />
          <SetListStats set={set} />
        </div>
      </div>
    </div>
  );
}
