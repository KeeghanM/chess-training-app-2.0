import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getUserServer() {
  const { getUser, isAuthenticated } = await getKindeServerSession();
  const user = await getUser();
  const hasAuth = await isAuthenticated();
  return { user, hasAuth };
}
