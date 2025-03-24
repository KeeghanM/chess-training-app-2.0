'use client'

import type { ReactNode } from 'react'

import * as Frigade from '@frigade/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { env } from '~/env'

export default function Providers({
  distinctId,
  children,
}: {
  distinctId: string
  children: ReactNode
}) {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <Frigade.Provider apiKey={env.FRIGADE_API_KEY} userId={distinctId}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </Frigade.Provider>
      </PostHogProvider>
    </QueryClientProvider>
  )
}
