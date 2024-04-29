'use client';

import Link from 'next/link';

import Button from '@/app/components/_elements/button';
import type { Tool } from '@/app/dashboard/page';

export function ToolGrid({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900">
      <div
        id={tool.id}
        className={`border-b border-gray-300 px-2 py-1 dark:border-slate-600 font-bold${
          tool.active ? ' text-orange-500' : ''
        }`}
      >
        {tool.active ? (
          <Link href={tool.trainingLink}>{tool.name}</Link>
        ) : (
          tool.name
        )}
      </div>
      <div className="p-2 text-sm">
        <p>{tool.description[0]}</p>
      </div>
      <div className="mt-auto flex flex-col items-center gap-2 p-2">
        {tool.active ? (
          <Link href={tool.trainingLink}>
            <Button variant="primary">{tool.buttonText}</Button>
          </Link>
        ) : (
          <Button disabled variant="secondary">
            Coming Soon
          </Button>
        )}
        {tool.learnMoreLink ? (
          <Link href={tool.learnMoreLink}>
            <Button variant="secondary">Learn More</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
