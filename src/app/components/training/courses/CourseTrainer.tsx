"use client";

import { PrismaUserCourse, PrismaUserLine } from "~/app/util/GetUserCourse";
import { useEffect, useState } from "react";
import { Button, Container, Flex, Text } from "@radix-ui/themes";
import { UserFens } from "@prisma/client";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// TODO: Bug fixes
// multiple wrong moves are not handled correctly during recap
// Seems to not reset the board properly maybe??
// TODO: Improvements
// Pause after successfully completing a line, show a "next line" button

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse;
  userLines: PrismaUserLine[];
  userFens: UserFens[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>(
    props.userLines[0] as PrismaUserLine,
  );
  const [position, setPosition] = useState(game.fen());
  const [teaching, setTeaching] = useState(false);
  const [mode, setMode] = useState<"normal" | "recap">("normal");
  const [currentWrongMove, setCurrentWrongMove] = useState(0);
  const [wrongMoves, setWrongMoves] = useState<{ move: string; fen: string }[]>(
    [],
  );
  const [seenFens, setSeenFens] = useState<string[]>(
    props.userFens.map((fen) => fen.fen),
  );
  const [newFens, setNewFens] = useState<string[]>([]);

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
    const currentMove =
      mode == "normal"
        ? moveList[game.history().length]
        : wrongMoves[currentWrongMove]?.move;
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

  const checkEndOfLine = async () => {
    if (game.history().length === moveList.length || mode == "recap") {
      // We've reached the end of the line
      // so we need to check if we got any wrong
      // if we have, we need to go back over them
      // if not, we need to move on to the next line
      if (wrongMoves.length > 0) {
        // We got some wrong, so we need to go back over them
        setMode("recap");
        setCurrentWrongMove(0);
        const fen = wrongMoves[currentWrongMove]?.fen as string;
        game.load(fen);
        setPosition(fen);
      } else {
        // We got them all right, so we need to move on
        // to the next line
        const currentLineIndex = props.userLines.indexOf(currentLine);
        const nextLine = props.userLines[currentLineIndex + 1];
        if (!nextLine) {
          // We've reached the end of the course
          // TODO: Handle this
          router.push("/training/courses");
          return;
        }

        if (nextLine.line.groupId !== currentLine.line.groupId) {
          // We've reached the end of the group
          // TODO: Handle this properly!
          confirm(
            "You've reached the end of the group! Click OK to move on to the next group.",
          );
        }

        setCurrentLine(nextLine);
        setMode("normal");
        setWrongMoves([]);
        await processNewFens();
        setNewFens([]);
        game.reset();
        setPosition(game.fen());
      }
    }
  };

  const processNewFens = async () => {
    const fensToUpload = newFens.filter((fen) => !seenFens.includes(fen));
    const newSeenFens = [...seenFens, ...fensToUpload];

    setSeenFens(newSeenFens);
    await fetch(`/api/courses/user/${props.userCourse.id}/fens/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + session?.user.id,
      },
      body: JSON.stringify({
        fens: fensToUpload,
      }),
    });
  };

  useEffect(() => {
    // If we're playing black, we need the first
    // white move to be made automatically
    // if we're playing white then we need to check
    // if we've seen the first move before
    if (orientation === "white") {
      if (!seenFens.includes(game.fen())) {
        makeTeachingMove();
      }
    } else {
      makeBookMove();
    }
  }, []);

  // When we drop a piece, we need to check if it's a valid move
  // if it is, we then need to check if it's the correct move
  const userDroppedPiece = (sourceSquare: Square, targetSquare: Square) => {
    // Make the move to see if it's legal
    const playerMove = game.move({
      from: sourceSquare,
      to: targetSquare,
    });
    if (playerMove === null) return false; // illegal move

    // Check if the move is correct
    const correctMove =
      mode == "normal"
        ? (moveList[game.history().length - 1] as string)
        : (wrongMoves[currentWrongMove]?.move as string);

    if (correctMove !== playerMove.san) {
      game.undo();
      setWrongMoves([...wrongMoves, { move: correctMove, fen: game.fen() }]);
      makeTeachingMove();
      return false;
    }

    // We played the correct move
    if (mode == "normal") {
      // log the previous fen as one we've seen and done right.
      game.undo();
      setNewFens([...newFens, game.fen()]);
      game.move(playerMove);

      // Update the position and continue
      setPosition(game.fen());
      makeBookMove();
    } else {
      // Remove the move from the wrong moves
      wrongMoves.splice(currentWrongMove, 1);
      setCurrentWrongMove(currentWrongMove + 1);
    }
    checkEndOfLine();
    return true;
  };

  return (
    <Container size={"1"} mt={"3"}>
      <Flex direction={"column"} gap={"6"}>
        <Flex direction={"column"} gap={"2"}>
          <Text size={"4"}>
            Current Group: {currentLine.line.group.groupName}
          </Text>
          <Text size={"4"}>
            Current Line: {props.userLines.indexOf(currentLine) + 1}/
            {props.userLines.length} (
            {Math.round(
              ((props.userLines.indexOf(currentLine) + 1) /
                props.userLines.length) *
                100,
            )}
            %) {currentLine.line.lineName || ""}
          </Text>
        </Flex>
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
