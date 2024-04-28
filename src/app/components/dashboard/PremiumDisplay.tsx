'use client';

import Tippy from '@tippyjs/react';
import Link from 'next/link';

export default function PremiumDisplay(props: { isPremium: boolean }) {
  return (
    <Tippy content="Learn More about Premium Membership">
      <Link
        href="/premium"
        className={`mx-2 w-fit p-2 text-xs text-white shadow ${
          props.isPremium ? ' bg-orange-500' : ' bg-gray-500'
        }`}
      >
        {props.isPremium ? 'Premium' : 'Free'}
      </Link>
    </Tippy>
  );
}
