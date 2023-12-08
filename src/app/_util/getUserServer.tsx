import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "~/server/db";
import { PostHogClient } from "./trackEventOnServer";

export async function getUserServer() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  const hasAuth = await isAuthenticated();
  if (user) {
    try {
      const profile = await prisma.userProfile.findFirst({
        where: {
          id: user.id,
        },
      });

      return { user, hasAuth, profile };
    } catch (e) {
      //TODO: Proper error logging
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }
  return { user, hasAuth, profile: null };
}

export async function createUserProfile(user: KindeUser) {
  try {
    const username =
      user.email ??
      "User" + (Math.floor(Math.random() * 90000) + 10000).toString();
    await prisma.userProfile.create({
      data: { id: user.id, username },
    });
  } catch (e) {
    //TODO: Proper error logging
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}
