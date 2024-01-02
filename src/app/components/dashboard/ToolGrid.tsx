'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { Tool } from '~/app/dashboard/page'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'

export default function ToolGrid(props: { tool: Tool }) {
  const [showDescription, setShowDescription] = useState(false)
  const [parent] = useAutoAnimate()
  const router = useRouter()
  const tool = props.tool

  return (
    <div className="flex flex-col items-center bg-gray-100 p-4 dark:bg-slate-700 dark:text-white md:p-6">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-2">
          {tool.active ? (
            <Link href={tool.href}>
              <Heading as={'h3'}>{tool.name}</Heading>
            </Link>
          ) : (
            <Heading as={'h3'} color="#666">
              {tool.name}
            </Heading>
          )}
          <div className="flex flex-col gap-2" ref={parent}>
            {
              // Only show the first line of the description
              // unless the user has clicked "Show More"
              tool.description
                .slice(0, showDescription ? undefined : 1)
                .map((line) => (
                  <p key={line}>{line}</p>
                ))
            }
            <Button
              onClick={() => setShowDescription(!showDescription)}
              variant={'tertiary'}
            >
              {showDescription ? 'Hide' : 'Show More'}
            </Button>
          </div>
        </div>
        {tool.active ? (
          <Button variant="primary" onClick={() => router.push(tool.href)}>
            {tool.buttonText}
          </Button>
        ) : (
          <Button variant="secondary" disabled={true}>
            Coming Soon
          </Button>
        )}
      </div>
    </div>
  )
}
