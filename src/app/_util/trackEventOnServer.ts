import { PostHog } from "posthog-node";
import getDistinctId from "./getDistinctId";

export function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

export async function trackEventOnServer(
  event: string,
  data?: Record<string, string>,
) {
  const posthog = PostHogClient();
  posthog.capture({
    distinctId: await getDistinctId(),
    event,
    properties: data,
  });
  await posthog.shutdownAsync();
}
