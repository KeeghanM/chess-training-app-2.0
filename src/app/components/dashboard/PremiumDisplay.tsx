'use client'

import Link from 'next/link'

import Tippy from '@tippyjs/react'

export default function PremiumDisplay(props: { isPremium: boolean }) {
  return (
    <Tippy content="Learn More about Premium Membership">
      <Link
        className={
          'p-2 text-xs mx-2 w-fit text-white shadow ' +
          (props.isPremium ? ' bg-orange-500' : ' bg-gray-500')
        }
        href="/premium"
      >
        {props.isPremium ? 'Premium' : 'Free'}
      </Link>
    </Tippy>
  )
}
