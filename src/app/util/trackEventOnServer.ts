import Mixpanel from "mixpanel";
import { getServerAuthSession } from "~/server/auth";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN!, {
  host: "api-eu.mixpanel.com",
});

export async function trackEventOnServer(
  event: string,
  data?: Record<string, string>,
) {
  // get all the headers and sessionCookie
  const session = await getServerAuthSession();
  const headersList = headers();
  const sessionId = await fetch(`${process.env.API_BASE_URL}/auth/cookies`)
    .then((resp) => resp.json())
    .then((resp) => resp.sessionId as string);

  // get request information like IP and user agent
  const ip =
    headersList.get("x-forwarded-for") ??
    headersList.get("Forwarded") ??
    headersList.get("x-real-ip");
  const ua = new UAParser(headersList.get("user-agent") ?? "");
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const device = ua.getDevice();

  // Get URL information
  const currentUrl = headersList.get("x-url");
  const utm_values = getUtmValues(currentUrl!);

  if (currentUrl?.includes("404")) return;

  const enhancedData = {
    ...data,
    currentUrl,
    ...utm_values,
    $device_id: sessionId,
    $user_id: session?.user?.id,
    $environment: process.env.NODE_ENV,
    $ip: ip,
    $browser: browser.name,
    $browser_version: browser.version,
    $os: os.name,
    $os_version: os.version,
    $device: device.type,
  };
  mixpanel.track(event, enhancedData);
}

function getUtmValues(url: string) {
  const urlObject = new URL(url);
  const utmSource = urlObject.searchParams.get("utm_source");
  const utmMedium = urlObject.searchParams.get("utm_medium");
  const utmCampaign = urlObject.searchParams.get("utm_campaign");
  const utmTerm = urlObject.searchParams.get("utm_term");
  const utmContent = urlObject.searchParams.get("utm_content");
  return { utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
}
