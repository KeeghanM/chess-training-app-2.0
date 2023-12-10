"use client";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Piece, Square } from "chess.js";
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
import Error from "../../general/ErrorPage";

// TODO: Bug fix - AutoNext doesn't work, and make it only work when puzzle is correct
// TODO: Add a "show solution/not sure" button that shows the solution and marks it as incorrect
// TODO: Add a "Show Solution" button when wrong move is played instead of auto showing it

export default function TacticsTrainer(props: {
  set: TacticsSet & {
    rounds: TacticsSetRound[];
  } & { puzzles: Puzzle[] };
}) {
  const { user } = getUserClient();
  const router = useRouter();

  // Setup main state for the game/puzzles
  const [puzzlesList, setPuzzlesList] = useState(props.set.puzzles);
  const [currentRound, setCurrentRound] = useState(
    props.set.rounds[props.set.rounds.length - 1]!,
  );
  const [currentPuzzle, setCurrentPuzzle] = useState(
    puzzlesList[currentRound.correct + currentRound.incorrect],
  );
  const [CompletedPuzzles, setCompletedPuzzles] = useState(
    currentRound.correct + currentRound.incorrect,
  );
  const [game, setGame] = useState(new Chess(currentPuzzle!.fen));
  const [orientation, setOrientation] = useState<"white" | "black">(
    game.turn() === "w" ? "black" : "white",
  ); // this is backwards as the first move is the opponent move
  const [position, setPosition] = useState(game.fen());
  const [soundEnabled, setSoundEnabled] = useState(true);

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
  const [thumbDisplay, setThumbDisplay] = useState<"none" | "up" | "down">(
    "none",
  );

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
    const lanNotation = game.history()[game.history().length - 1];
    playMoveSound(lanNotation!);
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
    setLoading(true);
    const newTime = Date.now();
    const timeTaken = newTime - startTime;
    try {
      await fetch("/api/tactics/stats/increaseTimeTaken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + user!.id,
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
      await trackEventOnClient("tactics_set_puzzle_correct", {
        rating: currentPuzzle!.rating.toString(),
      });
      await fetch("/api/tactics/stats/increaseCorrect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + user!.id,
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
      await trackEventOnClient("tactics_set_puzzle_incorrect", {
        rating: currentPuzzle!.rating.toString(),
      });
      await fetch("/api/tactics/stats/increaseIncorrect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + user!.id,
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

    setThumbDisplay("none");

    if (currentRound.correct + currentRound.incorrect + 1 >= props.set.size) {
      // We have completed the set
      // Create a new round
      setLoading(true);
      try {
        await trackEventOnClient("tactics_set_round_completed", {
          roundNumber: currentRound.roundNumber.toString(),
          correct: currentRound.correct.toString(),
          incorrect: currentRound.incorrect.toString(),
        });
        await fetch("/api/tactics/createRound", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            setId: props.set.id,
            roundNumber: currentRound.roundNumber + 1,
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
    setCompletedPuzzles(currentRound.correct + currentRound.incorrect + 1);
    const newPuzzle =
      puzzlesList[currentRound.correct + currentRound.incorrect + 1];
    const newGame = new Chess(newPuzzle!.fen);
    setCurrentPuzzle(newPuzzle);
    setGame(newGame);
    setOrientation(newGame.turn() === "w" ? "black" : "white");
    setPosition(newGame.fen());
    setPuzzleFinished(false);
    makeBookMove();
  };

  const checkEndOfLine = async () => {
    if (game.history().length >= currentPuzzle!.moves.split(",").length) {
      // We have reached the end of the line
      correctSound();
      setThumbDisplay("up");
      await increaseTimeTaken();
      await increaseCorrect();
      if (autoNext) {
        console.log("Auto Next Triggered");
        await goToNextPuzzle();
      }
      setPuzzleFinished(true);
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

  const checkPromotion = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => {
    // CHECK IF LAST POSITION, BASED ON SOURCE SQUARE, IS A PAWN
    // This works because we haven't actually made the move yet
    const lastMovePiece = game.get(sourceSquare);
    const sourceCol = sourceSquare.split("")[0];
    const sourceRank = sourceSquare.split("")[1];
    const targetCol = targetSquare.split("")[0];
    const targetRank = targetSquare.split("")[1];
    const pieceColor = piece.toString().split("")[0];
    const pieceType = piece.toString().split("")[1];

    if (
      lastMovePiece?.type === "p" &&
      ((pieceColor == "w" &&
        sourceRank === "7" &&
        targetRank === "8" &&
        sourceCol == targetCol) ||
        (pieceColor == "b" &&
          sourceRank === "2" &&
          targetRank === "1" &&
          sourceCol == targetCol))
    ) {
      return pieceType?.toLowerCase();
    }
    return undefined;
  };

  const userDroppedPiece = async (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => {
    // Make the move to see if it's legal
    const playerMove = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: checkPromotion(sourceSquare, targetSquare, piece),
    });
    if (playerMove === null) return false; // illegal move

    // Check if the move is correct
    const correctMove =
      currentPuzzle?.moves.split(",")[game.history().length - 1];

    if (correctMove !== playerMove.lan) {
      // We played the wrong move
      setThumbDisplay("down");
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
    await checkEndOfLine();
    return true;
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
          key={"btn" + moveNumber.toString() + move + moveColour}
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
          key={moveNumber.toString() + move + moveColour}
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
      <div className="flex items-center flex-row justify-between text-white">
        <p className="text-lg font-bold">{props.set.name}</p>
        <div
          className="flex flex-row items-center gap-2 hover:text-orange-500 cursor-pointer"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          <p>Sound {soundEnabled ? "On" : "Off"}</p>
          {soundEnabled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm9 .5s1 .5 1 1.75s-1 1.75-1 1.75"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm12.5 0l-3.5 4.5m0-4.5l3.5 4.5"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="flex text-xs md:text-sm flex-row justify-between md:justify-start gap-2">
        <p className="text-white flex flex-col items-center">
          <span className="font-bold">Round:</span>{" "}
          <span>{props.set.rounds.length}/8</span>
        </p>
        <p className="text-white flex flex-col items-center">
          <span className="font-bold">Completed:</span>
          <span>
            {CompletedPuzzles}/{props.set.size}
          </span>
        </p>
        <p className="text-white flex flex-col items-center">
          <span className="font-bold">Accuracy:</span>
          <span>
            {currentRound.correct == 0 && currentRound.incorrect == 0
              ? "0"
              : Math.round(
                  (currentRound.correct /
                    (currentRound.correct + currentRound.incorrect)) *
                    100,
                )}
            %
          </span>
        </p>
        <p className="text-white flex flex-col items-center">
          <span className="font-bold">Session Time:</span>
          <span>
            <TimeSince date={sessionTimeStarted} />
          </span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <Chessboard
            arePiecesDraggable={readyForInput}
            position={position}
            boardOrientation={orientation}
            boardWidth={Math.min(windowSize.height / 2, windowSize.width - 150)}
            customBoardStyle={{
              marginInline: "auto",
            }}
            // @ts-expect-error - ChessBoard doesnt expect AsyncFunction but works fine
            onPieceDrop={userDroppedPiece}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row items-center gap-2">
            <p className="flex items-center gap-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className={
                  orientation === "white"
                    ? "text-white"
                    : "text-black transform rotate-180"
                }
              >
                <path fill="currentColor" d="M1 21h22L12 2" />
              </svg>
              {orientation === "white" ? "White" : "Black"} to move
            </p>
            {thumbDisplay === "up" && (
              <div className="flex items-center gap-2 text-white z-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512"
                  className="text-lime-500"
                >
                  <path
                    fill="currentColor"
                    d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2h144c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48h-97.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192h64c17.7 0 32 14.3 32 32v224c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"
                  />
                </svg>
                <p>Correct!</p>
              </div>
            )}
            {thumbDisplay === "down" && (
              <div className="flex items-center gap-2 text-white z-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512"
                  className="text-red-500"
                >
                  <path
                    fill="currentColor"
                    d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2h144c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48h-97.5c-19 0-37.5 5.6-53.3 16.1l-38.5 25.7C176 91.6 160 121.6 160 153.7v111.2c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384h64c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32z"
                  />
                </svg>
                <p>Incorrect!</p>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse md:flex-col gap-2 flex-1">
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
            <div className="flex flex-col gap-2">
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
      </div>
    </div>
  );
}
