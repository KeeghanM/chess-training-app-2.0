'use client'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export function getUserClient() {
  const { user } = useKindeBrowserClient()
  return { user }
}
