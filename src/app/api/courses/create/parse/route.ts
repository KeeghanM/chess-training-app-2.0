import { parse, type ParseTree } from "@mliebelt/pgn-parser";
import { getServerAuthSession } from "~/server/auth";
import ECO from "./ecoCodes";
import { errorResponse, successResponse } from "../../../responses";

interface CleanMove {
  notation: string;
  turn: string;
}
interface Tags {
  [key: string]: string;
}
export interface Line {
  tags: Tags;
  moves: CleanMove[];
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { pgnString } = await request.json();
  if (!pgnString) return errorResponse("Missing PGN String", 400);

  // Parse PGN String, and reject request if it is invalid
  let parsedLines: ParseTree[];
  try {
    parsedLines = parse(pgnString, { startRule: "games" }) as ParseTree[];
  } catch (error: any) {
    return errorResponse("Invalid PGN: " + error.message, 400);
  }

  // Now split out all the variations into separate lines
  let lines: Line[] = [];
  try {
    for (let line of parsedLines) {
      const tags = line.tags as unknown as Tags;
      recursiveParse([], line.moves, tags, lines);
    }
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }

  // Map the lines to a specific and a general opening name
  for (let line of lines) {
    // Specific
    let id = "";
    for (let move of line.moves) {
      id += move.notation;
      let openingName = ECO[id.toLowerCase()];
      if (openingName) {
        line.tags["Opening (Specific)"] = openingName;
      }
    }

    // General (min 3 moves by both sides)
    id = "";
    let moveCount = 0;
    for (let move of line.moves) {
      id += move.notation;
      moveCount++;
      let openingName = ECO[id.toLowerCase()];
      if (openingName) {
        line.tags["Opening (General)"] = openingName;
      }
      if (moveCount >= 4) {
        break;
      }
    }

    // We can also pick a "colour" for the line based on the last move
    let lastMove = line.moves[line.moves.length - 1];
    if (lastMove) {
      line.tags["Colour"] = lastMove.turn === "w" ? "White" : "Black";
    }
  }

  // Sort lines alphabetically by move, and then by number of moves (shortest first)
  // This is so that the lines are in a predictable order
  lines.sort((a, b) => {
    let aMove = a.moves[a.moves.length - 1];
    let bMove = b.moves[b.moves.length - 1];
    if (aMove && bMove) {
      let aMoveNotation = aMove.notation as any;
      let bMoveNotation = bMove.notation as any;
      return bMoveNotation - aMoveNotation; // Let JS be JS and sort strings as numbers
    }
    return a.moves.length - b.moves.length;
  });

  return successResponse(
    "Course Parsed Successfully",
    {
      lines,
    },
    200,
  );
}

function recursiveParse(
  movesSoFar: CleanMove[],
  newMoves: any[],
  tags: { [key: string]: string },
  outputArray: Line[],
) {
  let movesList = JSON.parse(JSON.stringify(movesSoFar)); // Deep Clone the array
  let clonedTags = JSON.parse(JSON.stringify(tags)); // Deep Clone the tags

  for (let move of newMoves) {
    for (let variation of move.variations) {
      recursiveParse(movesList, variation, clonedTags, outputArray);
    }
    const cleanMove: CleanMove = {
      notation: move.notation.notation,
      turn: move.turn,
    };
    movesList.push(cleanMove);
  }
  let line = {
    tags: clonedTags as { [key: string]: string },
    moves: movesList,
  };
  outputArray.push(line);
}
