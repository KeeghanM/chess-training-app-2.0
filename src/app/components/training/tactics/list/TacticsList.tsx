"use client";

import { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import TacticsSetCreator from "../create/TacticsSetCreator";
import Container from "~/app/components/_elements/container";
import { useEffect, useState } from "react";
import SetListItem from "./SetListItem";
import { getUserClient } from "~/app/_util/getUserClient";
import { ResponseJson } from "~/app/api/responses";

export default function TacticsList() {
  // TODO: Show a loading/fallback item
  const { user } = getUserClient();
  console.log("User list", user);
  const [sets, setSets] = useState<PrismaTacticsSet[]>([]);

  const getSets = async () => {
    console.log("Getting sets", user);

    if (!user) return null;
    const resp = await fetch(`/api/tactics/user`, {
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
  };

  const addSet = (set: PrismaTacticsSet) => {
    setSets([...sets, set]);
  };

  useEffect(() => {
    getSets().then((sets) => setSets(sets ?? []));
  }, [user]);

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <TacticsSetCreator
          setCount={sets.length}
          maxSets={3}
          setCreated={addSet}
        />
        {sets.length == 0 ? (
          <div className="w-full p-4 md:p-6 lg:p-12 h-24 bg-gray-100 grid place-content-center">
            <p className="text-sm italic">Your sets will appear here</p>
          </div>
        ) : (
          sets
            .sort((a, b) => {
              const fallback = new Date(0);
              return (
                new Date(b.lastTrained ?? fallback).getTime() -
                new Date(a.lastTrained ?? fallback).getTime()
              );
            })
            .map((set) => <SetListItem key={set.id} set={set} />)
        )}
      </div>
    </Container>
  );
}
