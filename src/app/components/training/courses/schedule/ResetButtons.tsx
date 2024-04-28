'use client'

import { useState } from 'react'

import * as AlertDialog from '@radix-ui/react-alert-dialog'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'

type ResetButtonProps = {
  groups: {
    id: string
    name: string
  }[]
}

export default function ResetButtons({ groups }: ResetButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const reset = (ids: string[]) => {
    setLoading(true)
    setError(null)
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-2">
        <Button variant="primary">Mark All Lines For Review</Button>
        <Button variant="accent" onClick={() => setOpen(true)}>
          Mark Specific Group For Review
        </Button>
      </div>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)]"
            onClick={() => setOpen(false)}
          />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-md md:p-6 flex flex-col gap-4">
            <div className="flex gap-2 flex-col md:flex-row">
              <select className="w-full md:w-fit border border-gray-300 px-4 py-1 bg-gray-100 text-black">
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <Button variant="primary" onClick={() => reset([])}>
                Mark for review
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
