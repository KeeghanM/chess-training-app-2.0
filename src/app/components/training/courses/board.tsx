import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Square } from "react-chessboard/dist/chessboard/types";
import { PrismaUserLine } from "~/app/util/GetUserCourse";
import { UserFens } from "@prisma/client";

export default function Board(props: {
  currentLine: PrismaUserLine;
  userFens: UserFens[];
}) {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  // Get all the data for the current line
  const fenList = props.userFens.map((fen) => fen.fen);
  const moveList = props.currentLine.line.moves.split(",");
  const orientation = props.currentLine.line.colour.toLowerCase() as
    | "white"
    | "black";

  const makeBookMove = () => {
    const currentMove = moveList[game.history().length];
    if (!currentMove) return;

    setTimeout(() => {
      game.move(currentMove);
      setPosition(game.fen());
    }, 500);
  };

  useEffect(() => {
    // If we're playing black, we need the first
    // white move to be made automatically
    if (orientation === "white") return;

    makeBookMove();
  }, []);

  // When we drop a piece, we need to check if it's a valid move
  // if it is, we then need to check if it's the correct move
  const userDroppedPiece = (sourceSquare: Square, targetSquare: Square) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      // promotion: "q", // always promote to a queen for example simplicity
    });
    if (move === null) return false;

    // Check if the move is correct
    const currentMove = moveList[game.history().length - 1];
    if (currentMove !== move.san) {
      game.undo();
      return false;
    }

    setPosition(game.fen());
    makeBookMove();
    return true;
  };

  return (
    <Chessboard
      position={position}
      onPieceDrop={userDroppedPiece}
      boardOrientation={orientation}
    />
  );
}
