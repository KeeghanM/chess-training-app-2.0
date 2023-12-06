import { redirect } from "next/navigation";
import type { TacticsSet, TacticsSetRound } from "@prisma/client";
import { getUserServer } from "./getUserServer";
import { ResponseJson } from "../api/responses";

export type PrismaTacticsSet = TacticsSet & { rounds: TacticsSetRound[] };

export async function GetTacticSets() {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

  const resp = await fetch(`${process.env.API_BASE_URL}/tactics/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.id}`,
    },
  });
  const json = (await resp.json()) as ResponseJson;
  if (json.message != "Sets found") {
    // TODO: Handle error
    return null;
  }

  return json.data?.sets as PrismaTacticsSet[];
}

export async function GetSetPuzzles(setId: string) {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

  const resp = await fetch(
    `${process.env.API_BASE_URL}/tactics/user/${setId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.id}`,
      },
    },
  );
  const json = (await resp.json()) as ResponseJson;
  if (json.message != "Set found") {
    // TODO: Handle error
    return null;
  }

  return json.data?.set;
}
