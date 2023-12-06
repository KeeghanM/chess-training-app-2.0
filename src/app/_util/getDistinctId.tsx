import { getUserServer } from "./getUserServer";

export default async function getDistinctId() {
  const { user } = await getUserServer();
  if (user) return user.id;

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
