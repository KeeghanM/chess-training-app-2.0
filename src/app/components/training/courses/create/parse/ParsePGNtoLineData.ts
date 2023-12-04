import { parse, type ParseTree } from "@mliebelt/pgn-parser";
import ECO from "./ecoCodes";

interface CleanMove {
  notation: string;
  turn: string;
}
type Tags = Record<string, string>;

export interface Line {
  tags: Tags;
  moves: CleanMove[];
}

export function ParsePGNtoLineData(pgnString: string) {
  if (!pgnString) return null;

  // Parse PGN String, and reject request if it is invalid
  const parsedLines = parse(pgnString, { startRule: "games" }) as ParseTree[];
  // Now split out all the variations into separate lines
  const lines: Line[] = [];
  for (const line of parsedLines) {
    const tags = line.tags as unknown as Tags;
    recursiveParse([], line.moves, tags, lines);
  }

  // Map the lines to a specific and a general opening name
  for (const line of lines) {
    // Specific
    let id = "";
    for (const move of line.moves) {
      id += move.notation;
      const openingName = ECO[id.toLowerCase()];
      if (openingName) {
        line.tags["Opening (Specific)"] = openingName;
      }
    }

    // General (min 3 moves by both sides)
    id = "";
    let moveCount = 0;
    for (const move of line.moves) {
      id += move.notation;
      moveCount++;
      const openingName = ECO[id.toLowerCase()];
      if (openingName) {
        line.tags["Opening (General)"] = openingName;
      }
      if (moveCount >= 4) {
        break;
      }
    }

    // We can also pick a "colour" for the line based on the last move
    const lastMove = line.moves[line.moves.length - 1];
    if (lastMove) {
      line.tags.Colour = lastMove.turn === "w" ? "White" : "Black";
    }
  }

  // Sort lines alphabetically by move, and then by number of moves (shortest first)
  // This is so that the lines are in a predictable order
  lines.sort((a, b) => {
    const aMove = a.moves[a.moves.length - 1];
    const bMove = b.moves[b.moves.length - 1];
    if (aMove && bMove) {
      const aMoveNotation = aMove.notation;
      const bMoveNotation = bMove.notation;
      return aMoveNotation.localeCompare(bMoveNotation);
    }
    return a.moves.length - b.moves.length;
  });

  return lines;
}

function recursiveParse(
  movesSoFar: CleanMove[],
  newMoves: ParseTree["moves"],
  tags: Record<string, string>,
  outputArray: Line[],
) {
  const movesList: CleanMove[] = JSON.parse(JSON.stringify(movesSoFar)); // Deep Clone the array
  const clonedTags: Record<string, string> = JSON.parse(JSON.stringify(tags)); // Deep Clone the tags

  for (const move of newMoves) {
    for (const variation of move.variations) {
      recursiveParse(movesList, variation, clonedTags, outputArray);
    }
    const cleanMove: CleanMove = {
      notation: move.notation.notation,
      turn: move.turn,
    };
    movesList.push(cleanMove);
  }
  const line = {
    tags: clonedTags,
    moves: movesList,
  };
  outputArray.push(line);
}
