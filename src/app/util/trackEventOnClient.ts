export default function trackEventOnClient(
  eventName: string,
  data: { [key: string]: string },
) {
  fetch("/api/logEvent", {
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
