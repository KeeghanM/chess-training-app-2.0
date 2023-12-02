import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { TacticsSet, TacticsSetRound } from "@prisma/client";

export type PrismaTacticsSet = TacticsSet & { rounds: TacticsSetRound[] };

export async function GetPuzzleSets() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const resp = await fetch(`${process.env.API_BASE_URL}/puzzles/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.id}`,
    },
  });
  const json = await resp.json();
  if (json.message != "Sets found") {
    // TODO: Handle error
    return null;
  }

  return json.data.sets as PrismaTacticsSet[];
}
