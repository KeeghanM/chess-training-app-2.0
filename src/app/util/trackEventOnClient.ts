export default async function trackEventOnClient(
  eventName: string,
  data: Record<string, string>,
) {
  await fetch("/api/logEvent", {
    method: "POST",
    body: JSON.stringify({
      eventName,
      data,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
