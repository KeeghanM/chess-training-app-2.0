'use client'

import { useState } from 'react'

import type { CuratedSet } from '@prisma/client'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import TextEditor from '~/app/components/general/TextEditor'

import GenerateSlug from '~/app/_util/GenerateSlug'

// TODO: rating should be a range

export default function SetCreator(props: {
  updateSets: (newSet: CuratedSet) => void
  removeSet?: (id: string) => void
  set?: CuratedSet
  children: React.ReactNode
}) {
  const { set, updateSets, removeSet } = props
  // Form
  const [name, setName] = useState(set?.name ?? '')
  const [description, setDescription] = useState(set?.description ?? '')
  const [minRating, setMinRating] = useState(set?.minRating ?? 500)
  const [maxRating, setMaxRating] = useState(set?.maxRating ?? 2500)
  const [price, setPrice] = useState(set?.price ?? 0)
  const [published, setPublished] = useState(set?.published ?? false)

  // Status
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'deleting'>('idle')

  const createSet = async () => {
    setStatus('saving')
    try {
      const resp = await fetch('/api/admin/curated-sets', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug: GenerateSlug(name),
          description,
          minRating,
          maxRating,
          price,
          published,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Set created') throw new Error(json.message)

      const newSet = json.data!.set as CuratedSet
      updateSets(newSet)
      close()
    } catch (e) {
      console.error(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    }
    setStatus('idle')
  }

  const updateSet = async () => {
    if (!set) return
    setStatus('saving')
    try {
      const resp = await fetch(`/api/admin/curated-sets`, {
        method: 'PATCH',
        body: JSON.stringify({
          id: set.id,
          name,
          slug: GenerateSlug(name),
          size: set.size,
          description,
          minRating,
          maxRating,
          price,
          published,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Set updated') throw new Error(json.message)

      const newSet = json.data!.set as CuratedSet
      updateSets(newSet)
      close()
    } catch (e) {
      console.error(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    }
    setStatus('idle')
  }

  const deleteSet = async () => {
    if (!set || removeSet == undefined) return
    if (!confirm('Are you sure you want to delete this set?')) return

    setStatus('deleting')
    try {
      const resp = await fetch(`/api/admin/curated-sets`, {
        method: 'DELETE',
        body: JSON.stringify({
          id: set.id,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Set deleted') throw new Error(json.message)

      removeSet(set.id)
      close()
    } catch (e) {
      console.error(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    }
    setStatus('idle')
  }

  const close = () => {
    setOpen(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>{props.children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)]"
          onClick={close}
        />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-md md:p-6">
          <Heading as={'h2'}>{set ? set.name : 'Create new set'}</Heading>
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            <div className="">
              <label htmlFor="name">Name</label>
              <input
                className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  id="minRating"
                  type="number"
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                />
              </div>
              <div className="">
                <label htmlFor="rating">Max Rating</label>
                <input
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  id="minRating"
                  type="number"
                  value={maxRating}
                  onChange={(e) => setMaxRating(parseInt(e.target.value))}
                />
              </div>
              <div className="">
                <label htmlFor="price">Price (in pence)</label>
                <input
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
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
                className="border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={set ? updateSet : createSet}
              disabled={status != 'idle'}
            >
              {status == 'saving' ? (
                <>
                  Saving <Spinner />
                </>
              ) : (
                'Save'
              )}
            </Button>
            {set && (
              <Button
                variant="danger"
                onClick={deleteSet}
                disabled={status != 'idle'}
              >
                {status == 'deleting' ? (
                  <>
                    Deleting <Spinner />
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            )}
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
