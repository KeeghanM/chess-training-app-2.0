import { getServerAuthSession } from "~/server/auth";
export default async function getDistinctId() {
  const session = await getServerAuthSession();
  if (session) return session.user!.id!;

  const sessionId = await fetch(`${process.env.API_BASE_URL}/auth/cookies`)
    .then((resp) => resp.json())
    .then((resp) => resp.sessionId as string)
    .catch((err) => {
      // TODO: Log this error
      console.error(err);
      return "anonymous";
    });

  if (sessionId) return sessionId;

  return "anonymous";
}
