'use client';

import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';
import * as Sentry from '@sentry/nextjs';

export type availableTypes = 'line' | 'tactic';
export default function XpTracker(props: {
  counter: number;
  type: availableTypes;
}) {
  const [show, setShow] = useState(false);
  const [xpToAdd, setXpToAdd] = useState(0);

  const calculateXp = (type: availableTypes) => {
    switch (type) {
      case 'line':
        return 15;
      case 'tactic':
        return 5;
      default:
        return 5;
    }
  };

  useEffect(() => {
    if (props.counter === 0) return;
    // Calculate the XP to add
    const xpToAdd = calculateXp(props.type);
    setXpToAdd(xpToAdd);
    // We hide and show it, just in case the user gets multiple XP
    // in a short period of time
    setShow(false);
    setShow(true);
    // Hide the message after 3.5 seconds
    setTimeout(() => {
      setShow(false);
    }, 2500);
    // Add the XP to the user
    (async () => {
      const resp = await fetch('/api/profile/xp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xp: xpToAdd, type: props.type }),
      });
      const json = (await resp.json()) as ResponseJson;
      if (json.message != 'XP added') throw new Error(json.message);
    })().catch((e) => {
      Sentry.captureException(e);
    });
  }, [props.counter]);

  return show ? (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="z-50 w-fit animate-fade-up bg-green-500 px-4 py-2 text-white shadow-xl">
        +{xpToAdd} XP
      </div>
    </div>
  ) : null;
}
