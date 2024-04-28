'use client';

import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';

import Button from '../../_elements/button';
import Spinner from '../../general/Spinner';

export default function AddToSet(props: { setId: string; puzzleId?: string }) {
  const { setId, puzzleId } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addPuzzleToSet = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/admin/curated-sets/curatedPuzzle', {
        method: 'POST',
        body: JSON.stringify({
          setId,
          puzzleid: puzzleId,
        }),
      });
      const json = (await resp.json()) as ResponseJson;
      if (json.message !== 'Puzzle added to set') throw new Error(json.message);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
  }, [puzzleId, setId]);

  return (
    <>
      <Button
        className="mt-1 w-full"
        disabled={loading}
        variant="accent"
        onClick={addPuzzleToSet}
      >
        {loading ? (
          <>
            Add to set <Spinner />
          </>
        ) : (
          'Add to Set'
        )}
      </Button>
      {error ? <p className="text-red-500">{error}</p> : null}
    </>
  );
}
