'use client';

import type { CuratedSet } from '@prisma/client';
import * as Sentry from '@sentry/react';
import { useState } from 'react';

import { GenerateSlug } from '@/app/_util/generate-slug';
import type { ResponseJson } from '@/app/api/responses';
import { Button } from '@/app/components/_elements/button';
import { Spinner } from '@/app/components/general/spinner';
import { TextEditor } from '@/app/components/general/text-editor';

export function SetEditor({ set }: { set: CuratedSet }) {
  // Form
  const [name, setName] = useState(set.name);
  const [description, setDescription] = useState(set.description ?? '');
  const [shortDescription, setShortDescription] = useState(set.shortDesc ?? '');
  const [minRating, setMinRating] = useState(set.minRating);
  const [maxRating, setMaxRating] = useState(set.maxRating);
  const [price, setPrice] = useState(set.price);
  const [published, setPublished] = useState(set.published);

  // Status
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'deleting'>('idle');

  const updateSet = async () => {
    setStatus('saving');
    try {
      const resp = await fetch(`/api/admin/curated-sets`, {
        method: 'PATCH',
        body: JSON.stringify({
          id: set.id,
          name,
          slug: GenerateSlug(name),
          size: set.size,
          description,
          shortDesc: shortDescription,
          minRating,
          maxRating,
          price,
          published,
        }),
      });
      const json = (await resp.json()) as ResponseJson;
      if (json.message !== 'Set updated') throw new Error(json.message);
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('Something went wrong');
    }
    setStatus('idle');
  };

  return (
    <div className="flex max-h-[70vh] flex-1 flex-col gap-2 border border-purple-700 bg-purple-700 bg-opacity-20 p-2 text-black dark:text-white lg:border-4">
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
        <div className="">
          <label htmlFor="name">Name</label>
          <input
            className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="">
          <label htmlFor="shortDescription">Short Description</label>
          <input
            className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
            id="shortDescription"
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div className="">
          <label htmlFor="description">Description</label>
          <TextEditor value={description} onChange={setDescription} />
        </div>
        <div className="flex flex-row gap-4">
          <div className="">
            <label htmlFor="rating">Min Rating</label>
            <input
              className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
              id="minRating"
              type="number"
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value))}
            />
          </div>
          <div className="">
            <label htmlFor="rating">Max Rating</label>
            <input
              className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
              id="minRating"
              type="number"
              value={maxRating}
              onChange={(e) => setMaxRating(parseInt(e.target.value))}
            />
          </div>
          <div className="">
            <label htmlFor="price">Price (in pence)</label>
            <input
              className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="published">Published</label>
          <input
            checked={published}
            className="border border-gray-300 bg-gray-100 px-4 py-2 text-black"
            id="published"
            type="checkbox"
            onChange={(e) => setPublished(e.target.checked)}
          />
        </div>
      </div>
      <Button
        disabled={status !== 'idle'}
        variant="primary"
        onClick={updateSet}
      >
        {status === 'saving' ? (
          <>
            Saving <Spinner />
          </>
        ) : (
          'Save'
        )}
      </Button>
      {error ? <p className="text-red-500">{error}</p> : null}
    </div>
  );
}
