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
import { getUserClient } from "~/app/_util/getUserClient";
import type { Puzzle, TacticsSet, TacticsSetRound } from "@prisma/client";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import TimeSince from "../../general/TimeSince";

// TODO: Bug fix - AutoNext doesn't always work
// TODO: Bug fix - wrong sound playing
// TODO: Add an audio toggle
// TODO: Add success/error sign

export default function TacticsTrainer(props: {
  set: TacticsSet & {
    rounds: TacticsSetRound[];
  } & { puzzles: Puzzle[] };
}) {
  const { user } = getUserClient();
  const router = useRouter();

  // Setup main state for the game/puzzles
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
  const [position, setPosition] = useState(game.fen());
  const [soundEnabled, setSoundEnabled] = useState(true); // TODO: Add to user settings

  // Setup SFX
  const [checkSound] = useSound("/sfx/check.mp3");
  const [captureSound] = useSound("/sfx/capture.mp3");
  const [promotionSound] = useSound("/sfx/promote.mp3");
  const [castleSound] = useSound("/sfx/castle.mp3");
  const [moveSound] = useSound("/sfx/move.mp3");
  const [correctSound] = useSound("/sfx/correct.mp3");
  const [incorrectSound] = useSound("/sfx/incorrect.mp3");

  // Setup state for the settings/general
  const [autoNext, setAutoNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readyForInput, setReadyForInput] = useState(false);
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
    const timeoutId = setTimeout(async () => {
      await trackEventOnClient("tactics_set_puzzle_started", {
        rating: currentPuzzle!.rating.toString(),
        themes: currentPuzzle!.themes,
      });
      makeMove(move);
      setReadyForInput(true);
    }, 500);
    return timeoutId;
  };

  const increaseTimeTaken = async () => {
    setLoading(true);
    const newTime = Date.now();
    const timeTaken = newTime - startTime;
    try {
      await fetch("/api/tactics/stats/increaseTimeTaken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: currentRound.id,
          timeTaken,
          setId: props.set.id,
        }),
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    setStartTime(newTime);
    setLoading(false);
  };

  const increaseCorrect = async () => {
    setLoading(true);
    try {
      await fetch("/api/tactics/stats/increaseCorrect", {
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
    setLoading(false);
  };
  const increaseIncorrect = async () => {
    setLoading(true);
    try {
      await fetch("/api/tactics/stats/increaseIncorrect", {
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
    setLoading(false);
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
      setLoading(true);
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
      await exit();
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
      correctSound();
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

  const showIncorrectSequence = async () => {
    let counter = 0;
    const timeouts = [];
    for (
      let i = game.history().length;
      i < currentPuzzle!.moves.split(",").length;
      i++
    ) {
      counter++;
      const move = currentPuzzle?.moves.split(",")[i];
      if (!move) return;

      const timeoutPromise = new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          makeMove(move);
          resolve(timeoutId);
        }, 1000 * counter);
      });

      timeouts.push(timeoutPromise);
    }

    await Promise.all(timeouts);
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
      // We played the wrong move
      incorrectSound();
      game.undo();
      setReadyForInput(false);
      await showIncorrectSequence();
      await increaseIncorrect();
      setReadyForInput(true);
      setPuzzleFinished(true);
      return false;
    }
    playMoveSound(correctMove);
    setPosition(game.fen());
    makeBookMove();
    checkEndOfLine();
  };

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const moveColour = index % 2 === 0 ? "White" : "Black";
    const FlexText = () => (
      <p>
        {moveColour == "White" && (
          <span className="font-bold">{moveNumber}</span>
        )}{" "}
        <span>{move}</span>
      </p>
    );

    if (puzzleFinished) {
      return (
        <button
          key={moveNumber.toString() + move}
          className="bg-none hover:bg-purple-800 text-white px-1 py-1 h-max max-h-fit"
          onClick={async () => {
            await trackEventOnClient("tactics_set_jump_to_move", {});

            const newGame = new Chess(currentPuzzle!.fen);
            for (let i = 0; i <= index; i++) {
              newGame.move(game.history()[i]!);
            }
            setPosition(newGame.fen());
          }}
        >
          <FlexText />
        </button>
      );
    } else {
      return (
        <div
          key={moveNumber.toString() + move}
          className="px-1 py-1 text-white"
        >
          <FlexText />
        </div>
      );
    }
  });

  useEffect(() => {
    // The puzzles come in with the first opponent move NOT played
    // so we need to play the first move whenever the puzzle changes
    const firstMove = currentPuzzle?.moves.split(",")[0];
    const timeoutId = makeFirstMove(firstMove!);

    return () => clearTimeout(timeoutId);
  }, [currentPuzzle]);

  const exit = async () => {
    setLoading(true);
    await increaseTimeTaken();
    await trackEventOnClient("tactics_set_closed", {});
    router.push("/training/tactics/list");
    setLoading(false);
    return;
  };

  const windowSize = useWindowSize() as { width: number; height: number };
  return (
    <div className="relative bg-purple-700 p-4">
      {loading && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.3)] grid place-items-center z-50">
          <Spinner />
        </div>
      )}
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
          <div className="flex flex-wrap content-start gap-1 bg-purple-600 h-full p-2">
            {PgnDisplay.map((item) => item)}
          </div>
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
          <Button variant="danger" onClick={exit}>
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
