import { redirect } from "next/navigation";
import type { Puzzle, TacticsSet, TacticsSetRound } from "@prisma/client";
import { getUserServer } from "./getUserServer";
import type { ResponseJson } from "../api/responses";
import * as Sentry from "@sentry/nextjs";

export type PrismaTacticsSet = TacticsSet & { rounds: TacticsSetRound[] };
export type PrismaTacticsSetWithPuzzles = PrismaTacticsSet & {
  puzzles: Puzzle[];
};

export async function GetTacticSets() {
  const { user } = await getUserServer();
  if (!user) redirect("/auth/signin");
  try {
    const resp = await fetch(`${process.env.API_BASE_URL}/tactics/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.id}`,
      },
    });
    const json = (await resp.json()) as ResponseJson;
    if (json.message != "Sets found") {
      throw new Error(json.message);
    }

    return json.data?.sets as PrismaTacticsSet[];
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
}

export async function GetSetPuzzles(setId: string) {
  const { user } = await getUserServer();
  if (!user) redirect("/auth/signin");

  try {
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
      throw new Error(json.message);
    }

    const set = json.data!.set as PrismaTacticsSetWithPuzzles;
    set.puzzles.sort((a, b) => {
      return a.id.localeCompare(b.id);
    });

    return set;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
}
