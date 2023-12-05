"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Select from "react-select";
import Button from "~/app/components/_elements/button";
import Heading from "~/app/components/_elements/heading";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import { useState } from "react";
import Spinner from "~/app/components/general/Spinner";
import { useSession } from "next-auth/react";
import type { ResponseJson } from "~/app/api/responses";

interface TacticsSetCreatorProps {
  setCount: number;
  maxSets: number;
  setCreated: (set: PrismaTacticsSet) => void;
}
export default function TacticsSetCreator(props: TacticsSetCreatorProps) {
  const { data: session } = useSession();
  const { setCount, maxSets, setCreated } = props;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [size, setsize] = useState(500);
  const [themesList, setThemesList] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(1);
  const [rating, setRating] = useState(1500);
  const options = [
    { value: "pin", label: "Pin" },
    { value: "fork", label: "Fork" },
    { value: "skewer", label: "Skewer" },
    { value: "xRayAttack", label: "X-Ray" },
    { value: "discoveredAttack", label: "Discovered attack" },
    { value: "sacrifice", label: "Sacrifice" },
    { value: "attraction", label: "Attraction" },
    { value: "deflection", label: "Deflection" },
    { value: "interference", label: "Interference" },
    { value: "clearance", label: "Clearance" },
    { value: "capturingDefender", label: "Capture the defender" },
    { value: "intermezzo", label: "Intermezzo" },
    { value: "zugzwang", label: "Zugzwang" },
    { value: "quietMove", label: "Quiet move" },
    { value: "defensiveMove", label: "Defensive move" },
    { value: "opening", label: "Opening" },
    { value: "middlegame", label: "Middlegame" },
    { value: "endgame", label: "Endgame" },
    { value: "mate", label: "Checkmate" },
    { value: "enPassant", label: "En Passant" },
  ];

  const difficultyAdjuster = (d: number) => {
    return d == 0 ? 0.9 : d == 1 ? 1 : 1.2;
  };
  const GetPuzzlesForSet = async (
    rating: number,
    count: number,
    themes: string[],
  ) => {
    const params: {
      rating: string;
      count: string;
      themesType: "ONE" | "ALL";
      themes?: string;
    } = {
      rating: Math.round(rating * difficultyAdjuster(difficulty)).toString(),
      count: count.toString(),
      themesType: "ONE",
    };
    if (themes.length > 0) {
      params.themes = JSON.stringify(themes);
    }
    const paramsString = new URLSearchParams(params).toString();
    const queryUrl = "https://chess-puzzles.p.rapidapi.com/?" + paramsString;
    try {
      const resp = await fetch(queryUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-host": "chess-puzzles.p.rapidapi.com",
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY!,
        },
      });
      const json = (await resp.json()) as ResponseJson;
      const puzzles = json.data?.puzzles;
      if (!puzzles) throw new Error("No Puzzles Returned");

      return puzzles as {
        fen: string;
        moves: string[];
        rating: number;
        themes: string[];
      }[];
    } catch (e) {
      // TODO: Proper error handling
      if (e instanceof Error) console.log(e.message);
      return [];
    }
  };
  const resetForm = () => {
    setName("");
    setsize(500);
    setRating(1500);
    setDifficulty(1);
    setThemesList([]);
    setError("");
    setMessage("");
    setLoading(false);
  };
  const validForm = () => {
    setError("");
    setMessage("");

    if (name.length < 5) {
      setMessage("Name must be at least 5 characters");
      return false;
    }
    if (name.length > 150) {
      setMessage("Name must be below 150 characters");
      return false;
    }
    // Regex to check for potentially risky special chars
    const regex = /[@?#%^\-*]/g;
    if (regex.test(name)) {
      setMessage("Name must not include special characters");
      return false;
    }
    if (rating < 500 || rating > 3000) {
      setMessage("Rating must be between 500 & 3000");
      return false;
    }

    return true;
  };
  const createSet = async () => {
    setLoading(true);
    if (!validForm()) {
      setLoading(false);
      return;
    }

    const puzzles = await GetPuzzlesForSet(rating, size, themesList);
    if (!puzzles || puzzles.length == 0) {
      setError("No puzzles found");
      setLoading(false);
      return;
    }

    const cleanPuzzles = puzzles.map((puzzle) => {
      return {
        fen: puzzle.fen,
        moves: puzzle.moves.join(","),
        rating: puzzle.rating,
        themes: puzzle.themes.join(","),
      };
    });

    try {
      const resp = await fetch("/api/tactics/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + session?.user.id,
        },
        body: JSON.stringify({
          name: name,
          puzzles: cleanPuzzles,
        }),
      });
      const json = (await resp.json()) as ResponseJson;

      if (json.message != "Set Created") {
        setError("Oops! Something went wrong: " + json?.message);
        return;
      }

      const set = json.data?.set as PrismaTacticsSet | undefined;
      if (!set) {
        throw new Error("Something went wrong");
      }
      resetForm();
      setCreated(set);
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Unknown error");
    }
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4">
      <Heading as={"h3"}>
        {setCount}/{maxSets} Sets Created
      </Heading>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger className={setCount < maxSets ? "" : "hidden"}>
          <div className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 hover:bg-purple-600">
            <p>Create</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
              />
            </svg>
          </div>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50" />
          <AlertDialog.Content className="bg-white p-4 md:p-6 shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[75vh] z-50 overflow-y-auto">
            <AlertDialog.Title className="text-purple-700 text-lg font-bold">
              Create a new Tactics Set
            </AlertDialog.Title>
            <div className="flex flex-col gap-2 mb-4">
              <div className="">
                <label>Set Name</label>
                <input
                  type="text"
                  className="px-4 py-2 border border-gray-300 w-full"
                  value={name}
                  onInput={(e) => {
                    setName(e.currentTarget.value);
                  }}
                />
              </div>
              <div className="">
                <label htmlFor="">Set Size</label>
                <input
                  type="number"
                  className="px-4 py-2 border border-gray-300 w-full"
                  min={"150"}
                  max={"500"}
                  value={size}
                  onChange={(e) => {
                    setsize(parseInt(e.currentTarget.value));
                  }}
                />
                <p className="text-sm italic">
                  500 is recommended for maximal effect, but lower numbers will
                  make for faster training
                </p>
              </div>
              <div className="">
                <label>Your Rating</label>
                <input
                  type="number"
                  className="px-4 py-2 border border-gray-300 w-full"
                  min={"500"}
                  max={"3000"}
                  step={"10"}
                  value={rating}
                  onInput={(e) => {
                    setRating(parseInt(e.currentTarget.value));
                  }}
                />
              </div>
              <div className="">
                <label>Difficulty</label>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <Button
                    variant={difficulty == 0 ? "success" : "accent"}
                    onClick={() => setDifficulty(0)}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={difficulty == 1 ? "success" : "accent"}
                    onClick={() => setDifficulty(1)}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={difficulty == 2 ? "success" : "accent"}
                    onClick={() => setDifficulty(2)}
                  >
                    Hard
                  </Button>
                </div>
              </div>
              <div className="">
                <label>Themes to include</label>
                <Select
                  defaultValue={[]}
                  isMulti
                  name={"themes"}
                  // @ts-expect-error - react-select types are wrong
                  options={options}
                  onChange={(e) => {
                    const themes = e.map(
                      (theme: { label: string; value: string }) => theme.value,
                    );
                    setThemesList(themes);
                  }}
                />
                <p className="text-sm italic">
                  Leave blank for a random mix of all
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={async () => await createSet()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    Creating <Spinner />
                  </>
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
            {message && <p className="text-red-500 italic">{message}</p>}
            {error && <p className="text-red-500 italic">{error}</p>}
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
