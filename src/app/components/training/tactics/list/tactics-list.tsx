'use client';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';
import Container from '@/app/components/_elements/container';
import Spinner from '@/app/components/general/Spinner';
import type { PrismaTacticsSet } from '@/app/components/training/tactics//create/TacticsSetCreator';
import TacticsSetCreator from '@/app/components/training/tactics//create/TacticsSetCreator';
import { env } from '@/env';

import { SetListItem } from './set-list-item';

export function TacticsList({ hasUnlimitedSets }: { hasUnlimitedSets: boolean }) {
  
  const { user } = useKindeBrowserClient();
  const [sets, setSets] = useState<PrismaTacticsSet[]>([]);
  const [loading, setLoading] = useState(true);

  const getSets = async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const resp = await fetch(`/api/tactics/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = (await resp.json()) as ResponseJson;
      if (json.message !== 'Sets found') {
        throw new Error(json.message);
      }

      return json.data?.sets as PrismaTacticsSet[];
    } catch (e) {
      Sentry.captureException(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addSet = (set: PrismaTacticsSet) => {
    setSets([...sets, set]);
  };

  const updateList = () => {
    setSets([]);
    getSets()
      .then((sets) => setSets(sets ?? []))
      .catch((e: unknown) => {
        Sentry.captureException(e);
        setSets([]);
      });
  };

  useEffect(() => {
    getSets()
      .then((sets) => setSets(sets ?? []))
      .catch((e: unknown) => {
        Sentry.captureException(e);
        setSets([]);
      });
  }, [user]);

  return (
    <Container>
      <div className="flex items-center gap-2">
        <TacticsSetCreator
          hasUnlimitedSets={hasUnlimitedSets}
          loading={loading}
          maxSets={env.NEXT_PUBLIC_MAX_SETS}
          setCount={sets.length}
          setCreated={addSet}
        />
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {(() => {
          if (loading) {
            return (
              <>
                <div className="flex h-24 flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] opacity-50 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900">
                  <p className="m-auto flex w-fit gap-1">
                    Loading... <Spinner />
                  </p>
                </div>
                <div className="flex h-24 flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] opacity-50 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white  dark:shadow-slate-900">
                  {' '}
                  <p className="m-auto flex w-fit gap-1">
                    Loading... <Spinner />
                  </p>
                </div>
              </>
            );
          } else if (sets.length === 0) {
            return (
              <p className="text-center dark:text-white">
                You don&amp;t have any sets yet. Create one above!
              </p>
            );
          } else {
            return sets
              .sort((a, b) => {
                // add non-trained sets to the top, sorted by created date
                // then sort, in descending order, by the last trained date
                if (a.lastTrained === null) return -1;
                if (b.lastTrained === null) return 1;
                if (a.lastTrained === b.lastTrained)
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  );
                return (
                  new Date(b.lastTrained).getTime() -
                  new Date(a.lastTrained).getTime()
                );
              })
              .map((set) => (
                <SetListItem key={set.id} set={set} updated={updateList} />
              ));
          }
        })()}
      </div>
    </Container>
  );
}
