'use client';

import { env } from '@/env';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export const PostHogPageview = (): JSX.Element => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      // eslint-disable-next-line -- This is the quickest way to check this, it's not "always truthy"
      if (searchParams) {
        url = `${url}?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <></>;
};

export const PosthogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};
