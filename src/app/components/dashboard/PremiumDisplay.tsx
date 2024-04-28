'use client'

import Tippy from '@tippyjs/react'
import Link from 'next/link'


export default function PremiumDisplay(props: { isPremium: boolean }) {
  return (
    <Tippy content="Learn More about Premium Membership">
      <Link
        href="/premium"
        className={
          `p-2 text-xs mx-2 w-fit text-white shadow ${ 
          props.isPremium ? ' bg-orange-500' : ' bg-gray-500'}`
        }
      >
        {props.isPremium ? 'Premium' : 'Free'}
      </Link>
    </Tippy>
  )
}
