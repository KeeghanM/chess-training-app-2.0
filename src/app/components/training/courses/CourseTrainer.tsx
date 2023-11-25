"use client";

import { PrismaUserCourse, PrismaUserLine } from "~/app/util/GetUserCourse";
import { useEffect, useState } from "react";
import { Button, Container, Flex, Text } from "@radix-ui/themes";
import { UserFens } from "@prisma/client";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse;
  userLines: PrismaUserLine[];
  userFens: UserFens[];
}) {
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>(
    props.userLines[0] as PrismaUserLine,
  );
  const [position, setPosition] = useState(game.fen());
  const [teaching, setTeaching] = useState(false);

  // Get all the fens we have seen for the course ever
  const fenList = props.userFens.map((fen) => fen.fen);

  // Get all the data for the current line
  const moveList = currentLine.line.moves.split(",");
  const orientation = currentLine.line.colour.toLowerCase() as
    | "white"
    | "black";

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    const currentMove = moveList[game.history().length];
    if (!currentMove) return;

    setTimeout(() => {
      game.move(currentMove);
      setPosition(game.fen());
    }, 500);
  };

  // Makes a move for the "player"
  // and pauses to let them make a move
  const makeTeachingMove = () => {
    const currentMove = moveList[game.history().length];
    if (!currentMove) return;

    setTeaching(true);
    setTimeout(() => {
      game.move(currentMove);
      setPosition(game.fen());
    }, 500);
  };

  const resetTeachingMove = () => {
    game.undo();
    setTeaching(false);
    setPosition(game.fen());
  };

  useEffect(() => {
    // If we're playing black, we need the first
    // white move to be made automatically
    // if we're playing white then we need to check
    // if we've seen the first move before
    if (orientation === "white") {
      if (!fenList.includes(game.fen())) {
        makeTeachingMove();
      }
    } else {
      makeBookMove();
    }
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
      makeTeachingMove();
      return false;
    }
    setPosition(game.fen());
    makeBookMove();
    return true;
  };

  return (
    <Container size={"1"} mt={"3"}>
      <Flex direction={"column"} gap={"6"}>
        <Text size={"4"}>
          Current Group: {currentLine.line.group.groupName}
        </Text>
        <Chessboard
          position={position}
          onPieceDrop={userDroppedPiece}
          boardOrientation={orientation}
        />
        {teaching && <Button onClick={resetTeachingMove}>Got it!</Button>}
      </Flex>
    </Container>
  );
}
