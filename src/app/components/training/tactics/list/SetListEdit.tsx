'use client'

import { useEffect, useState } from 'react'

import type { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import type { PrismaTacticsSet } from '~/app/components/training/tactics/create/TacticsSetCreator'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

export default function SetListEdit(props: {
  set: PrismaTacticsSet
  user: KindeUser | null
  onFinished: () => void
}) {
  const { set } = props
  const user = props.user
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(set.name)

  useEffect(() => {
    setName(set.name)
    setLoading(false)
    setError('')
  }, [open])

  const close = () => {
    setOpen(false)
  }

  const deleteSet = async () => {
    setLoading(true)
    try {
      if (!user) throw new Error('Not logged in')
      const resp = await fetch('/api/tactics/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId: set.id,
        }),
      })

      const json = (await resp.json()) as ResponseJson

      if (json.message != 'Set Deleted')
        throw new Error(json?.message ?? 'Unknown error')

      trackEventOnClient('tactics_set_delete', {})
      props.onFinished()
      close()
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Unknown error')
    }
    setLoading(false)
  }

  const updateSet = async () => {
    setLoading(true)
    try {
      if (!user) throw new Error('Not logged in')
      const resp = await fetch('/api/tactics/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId: set.id,
          name,
        }),
      })

      const json = (await resp.json()) as ResponseJson

      if (json.message != 'Set Updated')
        throw new Error(json?.message ?? 'Unknown error')

      trackEventOnClient('tactics_set_updated', {})
      props.onFinished()
      close()
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Unknown error')
    }
    setLoading(false)
  }

  const DeleteButton = () => {
    return (
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="danger">Delete</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 z-20 bg-[rgba(0,0,0,0.5)]"
            onClick={close}
          />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[75vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white p-4 shadow-md md:p-6">
            <AlertDialog.Title className="text-lg font-bold text-purple-700">
              Are you sure you want to delete this?
            </AlertDialog.Title>
            <p>
              This action cannot be undone. You will lose all progress on your
              Tactics Set
            </p>
            <div className="flex gap-2">
              <AlertDialog.Action>
                <Button variant="danger" onClick={deleteSet}>
                  {loading ? (
                    <>
                      Deleting <Spinner />
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Cancel>
                <Button variant="primary" disabled={loading}>
                  Keep The Set
                </Button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    )
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)]"
            onClick={close}
          />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[75vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white p-4 shadow-md md:p-6">
            <AlertDialog.Title className="text-lg font-bold text-purple-700">
              Editing "{set.name}"
            </AlertDialog.Title>
            <div className="flex flex-col gap-2">
              <div className="">
                <label>Set Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  value={name}
                  onInput={(e) => {
                    setName(e.currentTarget.value)
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  variant="primary"
                  disabled={loading}
                  onClick={updateSet}
                >
                  {loading ? (
                    <>
                      Saving <Spinner />
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button variant="secondary" onClick={close}>
                  Close
                </Button>
                <DeleteButton />
              </div>
              <p className="text-sm italic text-red-500">{error}</p>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
