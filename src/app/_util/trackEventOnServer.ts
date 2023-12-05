import { PostHog } from "posthog-node";
import { getServerAuthSession } from "~/server/auth";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

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
  // get auth and sessionCookie
  const session = await getServerAuthSession();
  const sessionId = await fetch(`${process.env.API_BASE_URL}/auth/cookies`)
    .then((resp) => resp.json())
    .then((resp) => resp.sessionId as string);

  const distinctId = session?.user?.id ?? sessionId;
  await posthog.capture({ distinctId, event, properties: data });
  await posthog.shutdownAsync();
}
