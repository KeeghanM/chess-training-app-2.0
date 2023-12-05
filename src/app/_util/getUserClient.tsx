"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export async function getUserClient() {
  const { user } = await useKindeBrowserClient();
  return { user };
}
