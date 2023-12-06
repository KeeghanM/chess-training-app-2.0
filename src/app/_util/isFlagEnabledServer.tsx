import getDistinctId from "./getDistinctId";
import { PostHogClient } from "./trackEventOnServer";

export async function isFlagEnabledServer(flag: string) {
  const posthog = PostHogClient();
  const distinctId = await getDistinctId();
  const enabled = await posthog.isFeatureEnabled(flag, distinctId);
  await posthog.shutdownAsync();

  return enabled ?? false;
}

export async function getFlagPayloadServer(flag: string) {
  const posthog = PostHogClient();
  const distinctId = await getDistinctId();
  const payload = await posthog.getFeatureFlagPayload(flag, distinctId);
  await posthog.shutdownAsync();

  return payload;
}
