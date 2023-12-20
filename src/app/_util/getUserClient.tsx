'use client'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export function getUserClient() {
  const { user, permissions } = useKindeBrowserClient()
  return { user, permissions: permissions?.permissions }
}
