"use client";

import { useWindowSize } from "@uidotdev/usehooks";
import { PrismaUserCourse, PrismaUserLine } from "~/app/util/GetUserCourse";
import { useEffect, useState } from "react";
import { Box, Button, Container, Flex, Text } from "@radix-ui/themes";
import { UserFens } from "@prisma/client";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Spinner from "../../general/Spinner";
// @ts-ignore
import useSound from "use-sound";

// TODO: Add line stat tracking
// TODO: Add move/fen stat tracking
// TODO: Add comments/notes viewer that shows in teaching mode
// TODO:  Handle alternate moves (probably do this on the FEN level)
// TODO: BugFix - the board/pgn size is changing causing the board to jump around

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
  const [nextLine, setNextLine] = useState<PrismaUserLine | null>(null);
  const [mode, setMode] = useState<"normal" | "recap">("normal");
  const [currentWrongMove, setCurrentWrongMove] = useState(0);
  const [wrongMoves, setWrongMoves] = useState<{ move: string; fen: string }[]>(
    [],
  );
  const [existingFens, setExistingFens] = useState<string[]>(
    props.userFens.map((fen) => fen.fen),
  );
  const [trainedFens, setTrainedFens] = useState<string[]>([]);
  const [wrongFens, setWrongFens] = useState<string[]>([]);
  const [lineCorrect, setLineCorrect] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [interactive, setInteractive] = useState(true);
  const [checkSound] = useSound("/sfx/check.mp3");
  const [captureSound] = useSound("/sfx/capture.mp3");
  const [promotionSound] = useSound("/sfx/promotion.mp3");
  const [castleSound] = useSound("/sfx/castle.mp3");
  const [moveSound] = useSound("/sfx/move.mp3");

  // Get all the data for the current line
  const moveList = currentLine.line.moves.split(",");
  const orientation = currentLine.line.colour.toLowerCase() as
    | "white"
    | "black";

  const makeMove = (move: string) => {
    game.move(move);
    playMoveSound(move);
    setPosition(game.fen());
  };

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    const currentMove = moveList[game.history().length];
    if (!currentMove) return;

    const timeoutId = setTimeout(() => {
      makeMove(currentMove);
    }, 500);
    return timeoutId;
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
    const timeoutId = setTimeout(() => {
      makeMove(currentMove);
    }, 500);
    return timeoutId;
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

        // To display the PGN we need to reset after the recaps
        game.reset();
        moveList.forEach((move) => game.move(move));
        setPosition(game.fen());
        setGame(game);

        setNextLine(nextLine);
        setInteractive(false);
      }
    }
  };

  const startNextLine = async () => {
    if (!nextLine) return;

    setStatus("loading");
    await processNewFens();
    await processStats();
    setNextLine(null);
    setCurrentLine(nextLine);
    setMode("normal");
    setWrongMoves([]);
    setTrainedFens([]);
    game.reset();
    setStatus("idle");
    setInteractive(true);
    setPosition(game.fen());
  };

  const playMoveSound = (move: string) => {
    if (move.includes("+")) {
      checkSound();
    } else if (move.includes("x")) {
      captureSound();
    } else if (move.includes("=")) {
      promotionSound();
    } else if (move.includes("O")) {
      castleSound();
    } else {
      moveSound();
    }
  };

  const processNewFens = async () => {
    // Add new fens to the server
    const fensToUpload = trainedFens.filter(
      (fen) => !existingFens.includes(fen),
    );
    const allSeenFens = [...existingFens, ...fensToUpload];
    setExistingFens(allSeenFens);

    if (fensToUpload.length > 0) {
      const resp = await fetch(
        `/api/courses/user/${props.userCourse.id}/fens/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + session?.user.id,
          },
          body: JSON.stringify({
            fens: fensToUpload,
          }),
        },
      );
      const json = await resp.json();
      if (json.message != "Fens uploaded")
        throw new Error("Error uploading fens"); // TODO: Handle nicer
    }

    // Now we need to update the fens that we've trained
    // with the correct/incorrect status
    const fensWithStats = trainedFens.map((fen) => {
      return {
        fen: fen,
        correct: !wrongFens.includes(fen),
      };
    });

    const resp = await fetch(
      `/api/courses/user/${props.userCourse.id}/fens/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + session?.user.id,
        },
        body: JSON.stringify({
          fens: fensWithStats,
        }),
      },
    );

    const json = await resp.json();
    if (json.message != "Fens updated") throw new Error("Error updating fens"); // TODO: Handle nicer
  };

  const processStats = async () => {};

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
      // We played the wrong move
      setLineCorrect(false);
      game.undo();
      setWrongFens([...wrongFens, game.fen()]);
      setWrongMoves([...wrongMoves, { move: correctMove, fen: game.fen() }]);
      makeTeachingMove();
      return false;
    }

    playMoveSound(correctMove);

    // We played the correct move
    if (mode == "normal") {
      // log the previous fen as one we've seen and done right.
      game.undo();
      setTrainedFens([...trainedFens, game.fen()]);
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

  useEffect(() => {
    // If we're playing black, we need the first
    // white move to be made automatically
    // if we're playing white then we need to check
    // if we've seen the first move before
    let timeoutId: NodeJS.Timeout | undefined;
    if (orientation === "white") {
      if (!existingFens.includes(game.fen())) {
        timeoutId = makeTeachingMove();
      }
    } else {
      timeoutId = makeBookMove();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const moveColour = index % 2 === 0 ? "White" : "Black";
    const FlexText = () => (
      <Flex align={"center"} gap={"1"}>
        {moveColour == "White" && <Text weight={"bold"}>{moveNumber}</Text>}{" "}
        <Text>{move}</Text>
      </Flex>
    );

    if (nextLine) {
      return (
        <Button
          variant={"ghost"}
          color={"green"}
          style={{ cursor: "pointer" }}
          onClick={() => {
            const newGame = new Chess();
            for (let i = 0; i <= index; i++) {
              newGame.move(game.history()[i] as string);
            }
            setPosition(newGame.fen());
          }}
        >
          <FlexText />
        </Button>
      );
    } else {
      return <FlexText />;
    }
  });

  const windowSize = useWindowSize() as { width: number; height: number };
  return (
    <Container
      style={{
        maxHeight: "calc(80vh - 4rem)",
      }}
      mt={"3"}
    >
      <Flex direction={{ initial: "column", md: "row" }}>
        <Chessboard
          arePiecesDraggable={interactive}
          position={position}
          onPieceDrop={userDroppedPiece}
          boardOrientation={orientation}
          boardWidth={Math.min(windowSize.height / 2, windowSize.width - 50)}
          customBoardStyle={{
            marginInline: "auto",
          }}
        />
        <Box
          p={"4"}
          style={{
            background: "var(--plum-3)",
          }}
        >
          <Flex direction={"column"} gap={"2"}>
            <Text
              size={"4"}
              weight={"bold"}
              style={{
                minWidth: "max-content",
              }}
            >
              Group: {currentLine.line.group.groupName}
            </Text>
            <Text size={"4"}>
              Line: {props.userLines.indexOf(currentLine) + 1}/
              {props.userLines.length} (
              {Math.round(
                ((props.userLines.indexOf(currentLine) + 1) /
                  props.userLines.length) *
                  100,
              )}
              %) {currentLine.line.lineName || ""}
            </Text>
            <Flex
              wrap={"wrap"}
              gap={"1"}
              style={{ height: "100%", background: "var(--plum-2)" }}
              p={"4"}
            >
              {PgnDisplay.map((item) => item)}
            </Flex>
            <Flex direction={"column"} gap={"2"}>
              {teaching && <Button onClick={resetTeachingMove}>Got it!</Button>}
              {nextLine && (
                <Button
                  disabled={status == "loading"}
                  onClick={() => startNextLine()}
                >
                  Next Line {status == "loading" && <Spinner />}
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
