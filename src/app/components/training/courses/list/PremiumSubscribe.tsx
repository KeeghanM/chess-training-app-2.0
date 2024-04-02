import { useState } from 'react'

import * as AlertDialog from '@radix-ui/react-alert-dialog'

import Button from '~/app/components/_elements/button'
import StyledLink from '~/app/components/_elements/styledLink'
import GetPremiumButton from '~/app/components/ecomm/GetPremiumButton'
import Spinner from '~/app/components/general/Spinner'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

export default function PremiumSubscribe(props: { maxCourses: number }) {
  const { maxCourses } = props

  const [open, setOpen] = useState(false)

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <Button
        variant="primary"
        onClick={() => {
          setOpen(true)
          trackEventOnClient('create_course_premium_opened', {})
        }}
        className="flex items-center gap-2 bg-purple-700 px-4 py-2 text-white hover:bg-purple-600"
      >
        <p>Create New Course</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
          />
        </svg>
      </Button>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)]"
          onClick={close}
        />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[75vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white p-4 shadow-md md:p-6">
          <AlertDialog.Title className="text-lg font-bold text-purple-700">
            Create a new Course
          </AlertDialog.Title>
          <div className="flex flex-col gap-2">
            <p>
              You have reached the maximum number of courses ({maxCourses}) you
              can create as a free user.
            </p>
            <p className="italic">
              Either delete/archive some of your existing courses or upgrade to
              premium.
            </p>
            <p className="font-bold p-4 rounded bg-green-200">
              It's only £2.99/month to upgrade to premium!{' '}
              <StyledLink href="/premium">Learn more.</StyledLink>
            </p>
            <p>
              You get both unlimited tactics sets and openings courses plus a{' '}
              <strong>5%</strong> discount on all products.
            </p>
            <GetPremiumButton returnUrl="training/courses" />
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
