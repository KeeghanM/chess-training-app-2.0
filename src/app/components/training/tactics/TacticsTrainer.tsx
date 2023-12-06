"use client";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { useRouter } from "next/navigation";
import Spinner from "../../general/Spinner";
// @ts-expect-error - No types available
import useSound from "use-sound";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import Button from "../../_elements/button";
import type { ResponseJson } from "~/app/api/responses";
import { getUserClient } from "~/app/_util/getUserClient";
import type { Puzzle, TacticsSet, TacticsSetRound } from "@prisma/client";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import TimeSince from "../../general/TimeSince";

export default function TacticsTrainer(props: {
  set: TacticsSet & {
    rounds: TacticsSetRound[];
  } & { puzzles: Puzzle[] };
}) {
  const { user } = getUserClient();
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState(
    props.set.rounds[props.set.rounds.length - 1]!,
  );
  const [currentPuzzle, setCurrentPuzzle] = useState(
    props.set.puzzles[currentRound.correct + currentRound.incorrect],
  );
  const [CompletedPuzzles, setCompletedPuzzles] = useState(
    currentRound.correct + currentRound.incorrect,
  );
  const [game, setGame] = useState(new Chess(currentPuzzle!.fen));
  const [orientation, setOrientation] = useState<"white" | "black">(
    game.turn() === "w" ? "black" : "white",
  ); // this is backwards as the first move is the opponent move
  const [readyForInput, setReadyForInput] = useState(false);
  const [position, setPosition] = useState(game.fen());
  const [checkSound] = useSound("/sfx/check.mp3");
  const [captureSound] = useSound("/sfx/capture.mp3");
  const [promotionSound] = useSound("/sfx/promote.mp3");
  const [castleSound] = useSound("/sfx/castle.mp3");
  const [moveSound] = useSound("/sfx/move.mp3");
  const [autoNext, setAutoNext] = useState(false);
  const [puzzleFinished, setPuzzleFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionTimeStarted, setSessionTimeStarted] = useState(new Date());

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

  const makeMove = (move: string) => {
    game.move(move);
    playMoveSound(move);
    setPosition(game.fen());
  };

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    setReadyForInput(false);
    const currentMove = currentPuzzle?.moves.split(",")[game.history().length];
    if (!currentMove) return;

    const timeoutId = setTimeout(() => {
      makeMove(currentMove);
      setReadyForInput(true);
    }, 500);
    return timeoutId;
  };

  const makeFirstMove = (move: string) => {
    const timeoutId = setTimeout(() => {
      makeMove(move);
      setReadyForInput(true);
    }, 500);
    return timeoutId;
  };

  const increaseTimeTaken = async () => {
    const newTime = Date.now();
    const timeTaken = newTime - startTime;
    try {
      await fetch("/api/tactics/increaseTimeTaken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: currentRound.id,
          timeTaken,
        }),
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    setStartTime(newTime);
  };

  const increaseCorrect = async () => {
    try {
      await fetch("/api/tactics/increaseCorrect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: currentRound.id,
        }),
      });
    } catch (e) {
      // TODO: Handle error
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    setCurrentRound({ ...currentRound, correct: currentRound.correct + 1 });
  };
  const increaseIncorrect = async () => {
    try {
      await fetch("/api/tactics/increaseIncorrect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: currentRound.id,
        }),
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    setCurrentRound({ ...currentRound, incorrect: currentRound.incorrect + 1 });
  };

  const goToNextPuzzle = async () => {
    // Check if we've completed the set
    // in which case we need to create a new round
    // then redirect to the main lister
    // If we haven't then we need to change the puzzle
    // to the next one and update the state

    if (currentRound.correct + currentRound.incorrect + 1 >= props.set.size) {
      // We have completed the set
      // Create a new round
      try {
        await fetch("/api/tactics/createRound", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            setId: props.set.id,
          }),
        });
      } catch (e) {
        if (e instanceof Error) console.error(e);
      }
      router.push("/training/tactics");
      return;
    }
    // We haven't completed the set
    // so we need to change the puzzle
    setPuzzleFinished(false);
    setCompletedPuzzles(currentRound.correct + currentRound.incorrect + 1);
    const newPuzzle =
      props.set.puzzles[currentRound.correct + currentRound.incorrect + 1];
    const newGame = new Chess(newPuzzle!.fen);
    setCurrentPuzzle(newPuzzle);
    setGame(newGame);
    setOrientation(newGame.turn() === "w" ? "black" : "white");
    setPosition(newGame.fen());
    makeBookMove();
  };

  const checkEndOfLine = async () => {
    if (game.history().length >= currentPuzzle!.moves.split(",").length) {
      // We have reached the end of the line
      await increaseTimeTaken();
      await increaseCorrect();
      if (autoNext) {
        goToNextPuzzle();
      } else {
        setPuzzleFinished(true);
      }
      return true;
    }

    return false;
  };

  const userDroppedPiece = async (
    sourceSquare: Square,
    targetSquare: Square,
  ) => {
    // Make the move to see if it's legal
    const playerMove = game.move({
      from: sourceSquare,
      to: targetSquare,
    });
    if (playerMove === null) return false; // illegal move

    // Check if the move is correct
    const correctMove =
      currentPuzzle?.moves.split(",")[game.history().length - 1];

    if (correctMove !== playerMove.lan) {
      console.log("Incorrect move");
      // We played the wrong move
      game.undo();
      console.log({
        correctMove,
        playerMove: playerMove.lan,
      });
      await increaseIncorrect();

      // TODO: Show correct Sequence
      return false;
    }
    playMoveSound(correctMove);
    setPosition(game.fen());
    makeBookMove();
    checkEndOfLine();
  };

  useEffect(() => {
    // The puzzles come in with the first opponent move NOT played
    // so we need to play the first move whenever the puzzle changes
    const firstMove = currentPuzzle?.moves.split(",")[0];
    const timeoutId = makeFirstMove(firstMove!);

    return () => clearTimeout(timeoutId);
  }, [currentPuzzle]);

  const windowSize = useWindowSize() as { width: number; height: number };
  return (
    <div className="bg-purple-700 p-4">
      <p className="text-lg text-white font-bold">{props.set.name}</p>
      <div className="flex flex-col md:flex-row gap-2">
        <p className="text-white font-bold">
          Round: {props.set.rounds.length}/8
        </p>
        <p className="text-white font-bold">
          Completed: {CompletedPuzzles}/{props.set.size}
        </p>
        <p className="text-white font-bold">
          Accuracy:{" "}
          {currentRound.correct == 0 && currentRound.incorrect == 0
            ? "0"
            : Math.round(
                (currentRound.correct /
                  (currentRound.correct + currentRound.incorrect)) *
                  100,
              )}
          %
        </p>
        <p className="text-white font-bold">
          Session Time: <TimeSince date={sessionTimeStarted} />
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="">
          <Chessboard
            arePiecesDraggable={readyForInput}
            position={position}
            boardOrientation={orientation}
            boardWidth={Math.min(windowSize.height / 2, windowSize.width - 50)}
            customBoardStyle={{
              marginInline: "auto",
            }}
            // @ts-expect-error - ChessBoard doesnt expect AsyncFunction but works fine
            onPieceDrop={userDroppedPiece}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-wrap content-start gap-1 bg-purple-600 h-full p-2"></div>
          <label className="ml-auto flex items-center gap-2 text-sm text-white">
            <Toggle
              defaultChecked={autoNext}
              onChange={() => {
                setAutoNext(!autoNext);
              }}
            />
            <span>Auto Next</span>
          </label>
          {puzzleFinished && (
            <Button variant="accent" onClick={goToNextPuzzle}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
