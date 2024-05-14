'use client';

import type { ResponseJson } from '@/app/api/responses';
import type { PrismaUserLine } from '@/app/training/courses/[userCourseId]/page';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import type { Comment, Move, UserFen } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import Tippy from '@tippyjs/react';
import { useWindowSize } from '@uidotdev/usehooks';
import { Chess } from 'chess.js';
import type { Move as ChessMove } from 'chess.js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Arrow } from 'react-chessboard/dist/chessboard/types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { useAudio } from '@/app/hooks/use-audio';

import { getArrows } from '@/app/_util/string-to-arrows';
import { trackEventOnClient } from '@/app/_util/track-event-on-client';
import { ThemeSwitch } from '@/app/components/template/header/theme-switch';
import { Button } from '@/app/components/_elements/button';
import { Spinner } from '@/app/components/general/spinner';
import { XpTracker } from '@/app/components/general/xp-tracker';

import { Heading } from '../../_elements/heading';
import { StyledLink } from '../../_elements/styled-link';
import { ChessBoard } from '../chess-board';

import type { PrismaUserCourse } from './list/courses-list';

// TODO: Add delay on wrong move jumping
// TODO: Modal for confirming exit
// TODO: Ensure links in comments work
// TODO: Add onboarding for first time users

type PrismaMove = Move & { comment?: Comment | null };
type TrainingFen = {
  fen: string;
  commentId?: number;
};

export function CourseTrainer({
  userCourse,
  userLines,
  userFens,
}: {
  userCourse: PrismaUserCourse;
  userLines: PrismaUserLine[];
  userFens: UserFen[];
}) {
  const router = useRouter();
  const { user } = useKindeBrowserClient();

  // Line/Course State
  const [lines, setLines] = useState<PrismaUserLine[]>(userLines);
  const [allComments] = useState(
    userLines
      .map((line) => {
        return line.line.moves
          .map((move) => move.comment)
          .filter((comment) => comment !== null);
      })
      .flat()
      .filter((comment) => comment !== null) as Comment[],
  );
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>();
  const [nextLine, setNextLine] = useState<PrismaUserLine | null>(null);
  const [currentLineMoves, setCurrentLineMoves] = useState<PrismaMove[]>([]);
  const [indexOfOurLastMove, setIndexOfOurLastMove] = useState<number>(0);

  // Game State
  const [game, setGame] = useState(new Chess());
  const [gameReady, setGameReady] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [position, setPosition] = useState(game.fen());
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [highlightSquares, setHighlightSquares] = useState<
    Record<string, { backgroundColor: string }>
  >({});

  // Training State
  const [mode, setMode] = useState<'normal' | 'recap'>('normal');
  const [teaching, setTeaching] = useState(false);
  const [currentMove, setCurrentMove] = useState<PrismaMove>();
  const [currentWrongMove, setCurrentWrongMove] = useState(0);
  const [hadTeachingMove, setHadTeachingMove] = useState(false);
  const [lineCorrect, setLineCorrect] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [correctCounter, setCorrectCounter] = useState(0);
  const [incorrectCounter, setIncorrectCounter] = useState(0);

  // Tracking/Stats State
  const [existingFens, setExistingFens] = useState<TrainingFen[]>(
    userFens.map((fen) => {
      return { fen: fen.fen, commentId: fen.commentId ?? undefined };
    }),
  );
  const [trainedFens, setTrainedFens] = useState<TrainingFen[]>([]);
  const [wrongFens, setWrongFens] = useState<string[]>([]);
  const [wrongMoves, setWrongMoves] = useState<{ move: string; fen: string }[]>(
    [],
  );

  // General/Settings State
  const windowSize = useWindowSize() as { width: number; height: number };
  const [loading, setLoading] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [xpCounter, setXpCounter] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showComment, setShowComment] = useState(false);
  const [error, setError] = useState('');

  // SFX
  const incorrectSound = useAudio('/sfx/incorrect.mp3');
  const correctSound = useAudio('/sfx/correct.mp3');

  const getNextLine = (lines: PrismaUserLine[]) => {
    // Sorts the lines in order of priority
    // 1. Lines with a "revisionDate" in the past, sorted by date (oldest first)
    // 2. Lines with no "revisionDate", sorted by their groups sortOrder and then by their own sortOrder
    const now = new Date();

    const dueLines = lines
      .filter((line) => line.revisionDate && line.revisionDate < now)
      .sort(
        (a, b) =>
          (a.revisionDate?.getTime() ?? 0) - (b.revisionDate?.getTime() ?? 0),
      );
    if (dueLines.length > 0) return dueLines[0];

    const unseenLines = lines
      .filter((line) => !line.revisionDate)
      .sort((a, b) => {
        if (a.line.group.sortOrder < b.line.group.sortOrder) return -1;
        if (a.line.group.sortOrder > b.line.group.sortOrder) return 1;
        if (a.line.sortOrder < b.line.sortOrder) return -1;
        if (a.line.sortOrder > b.line.sortOrder) return 1;
        return 0;
      });
    if (unseenLines.length > 0) return unseenLines[0];

    return null;
  };

  const needsTeachingMove = () => {
    // If we haven't seen any fens, we need to teach the first move
    const allFens = [...existingFens, ...trainedFens];
    if (allFens.length === 0) return true;

    // Explaining the logic here is a bit tricky
    // Basically, we need to check if the CURRENT position is one we've trained before
    // But, we also need to check if the comment on the next move is different to any we've seen before
    // So we need both the current fen, the next fen, and the comment from the next move
    const currentFenString = game.fen();
    const currentFen = allFens.find((fen) => fen.fen === currentFenString);
    if (currentFen === undefined) return true; // We haven't seen this position before

    const nextMove = currentLineMoves[game.history().length];
    if (!nextMove) return false; // We've reached the end of the line

    const nextMoveComment = nextMove.comment?.comment;
    const fenComment = getComment(currentFen.commentId);

    const nextFenString = (() => {
      const newGame = new Chess(currentFenString);
      newGame.move(nextMove.move);
      return newGame.fen();
    })();
    const nextFen = allFens.find((fen) => fen.fen === nextFenString);
    const nextFenComment = getComment(nextFen?.commentId);

    if (fenComment === nextMoveComment || nextFenComment === nextMoveComment)
      return false;

    // If we've gotten this far, we need to teach the move
    return true;
  };

  const makeMove = (move: string) => {
    try {
      game.move(move);
      setPosition(game.fen());
    } catch (e) {
      // honestly, do nothing
      // I dunno why this is firing, I replicated it once but it didn;t actually affect the usage
      // I think it's to do with premoving and the chess.js library, but nothing actually breaks
      // so this is just here to stop logging it in sentry as an "unhandled error"
    }
  };

  const playOpponentsMove = () => {
    const opponentsMove = currentLineMoves[game.history().length];
    if (!opponentsMove) return;
    const opponentSan = opponentsMove.move;
    const commentId = opponentsMove.comment?.id;
    const comment = getComment(commentId);
    const trainedFen = { fen: game.fen(), commentId };
    setTrainedFens((prevTrainedFens) => [...prevTrainedFens, trainedFen]);

    const timeoutId = setTimeout(() => {
      makeMove(opponentSan);

      // Check if we need to show a comment
      const allFens = [...existingFens, ...trainedFens];
      const previouslySeenComment = allFens.find((fen) => {
        const fenComment = getComment(fen.commentId); // compare the actual comment, not just the id
        return fenComment === comment;
      });
      if (opponentsMove.comment && previouslySeenComment === undefined) {
        setShowComment(true);
        setInteractive(false);
        setTeaching(true);
        setHadTeachingMove(true);
      }
      // No opponent comment, but check if we need to show a teaching move
      else if (needsTeachingMove()) {
        makeTeachingMove();
      }
    }, 500);
    return timeoutId;
  };

  // Makes a move for the "player"
  // and pauses to let them make a move
  const makeTeachingMove = (delay = 500) => {
    const currentMove =
      mode === 'normal'
        ? currentLineMoves[game.history().length]?.move
        : wrongMoves[currentWrongMove]?.move;

    if (!currentMove) return;
    setHadTeachingMove(true);

    const timeoutId = setTimeout(() => {
      setTeaching(true);
      setInteractive(false);
      makeMove(currentMove);
    }, delay);
    return timeoutId;
  };

  const resetTeachingMove = () => {
    setTeaching(false);
    setInteractive(true);
    setShowComment(false);
    if (!currentLine) return;

    const lineColour = currentLine.line.colour.toLowerCase().charAt(0);

    if (game.turn() !== lineColour) {
      // We were shown a move for us to make, so we need to undo it
      game.undo();
      setPosition(game.fen());
    } else {
      // We were shown a comment on an opponents move
      // So now check if our next move is a teaching move
      if (needsTeachingMove()) makeTeachingMove();
    }
  };

  const checkEndOfLine = () => {
    if (game.history().length < indexOfOurLastMove && mode !== 'recap') return;

    // We've reached the end of the line
    if (wrongMoves.length > 0) {
      // We got some moves wrong, so we need to go back over them
      setMode('recap');
      setCurrentWrongMove(0);
      const fen = wrongMoves[currentWrongMove]?.fen;
      if (!fen) throw new Error('No FEN found');
      game.load(fen);
      setPosition(fen);
      return;
    }

    if (hadTeachingMove) {
      // If we had a teaching move, we want to go over the entire line again
      // to make sure we've got it all right. We don't want to do this if we
      // didn't have a teaching move as it must be a repeat of a learned lined.
      setTimeout(() => {
        setMode('normal');
        setHadTeachingMove(false);
        setCurrentWrongMove(0);
        const newGame = new Chess();
        setPosition(newGame.fen());
        setGame(newGame);
      }, 500);
      return;
    }

    try {
      // All the moves have now been gotten right and we've reviewed the line if needed
      // Now we want to log all the stats
      setXpCounter(xpCounter + 1);
      setLoading(true);
      processNewFens();
      const updatedLines = processStats();
      if (soundEnabled) correctSound();
      if (updatedLines === null) throw new Error('No updated lines'); // This is likely because we've lost auth somehow

      // Now we need to get the next line
      const nextLine = getNextLine(updatedLines);
      if (!nextLine) {
        // Nothing left to review/learn
        // TODO: Check if this is the first time completing the course
        // if so, show a nice modal popup and track event
        // For now, just redirect to the course page
        trackEventOnClient('course_completed', {
          courseName: userCourse.course.courseName,
        });
        router.push('/training/courses/');
        return;
      }

      if (nextLine.line.groupId !== currentLine?.line.groupId) {
        // We've reached the end of the group
        // TODO: Add a nice modal popup here
        trackEventOnClient('course_group_completed', {
          courseName: userCourse.course.courseName,
        });
      }

      // Because we may have had to go back over some moves
      // we need to reset the game to the start of the line
      // and then make all the moves up to the current point
      // to show the moves in the navigator
      game.reset();
      currentLineMoves.forEach((move) => game.move(move.move));
      setPosition(game.fen());
      setGame(game);

      // Setup for the next line
      setNextLine(nextLine);
      setLineCorrect(true);
      setInteractive(false);
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startNextLine = () => {
    if (!nextLine) return;
    setLoading(true);
    try {
      trackEventOnClient('course_next_line', {
        courseName: userCourse.course.courseName,
      });

      setNextLine(null);
      setCurrentLine(nextLine);
      setCurrentLineMoves(nextLine.line.moves);
      setMode('normal');
      setWrongMoves([]);
      setWrongFens([]);
      setHadTeachingMove(false);
      setLineCorrect(true);
      setInteractive(true);
      setTeaching(false);
      game.reset();
      setInteractive(true);
      setPosition(game.fen());
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getComment = (commentId: number | undefined) => {
    if (!commentId) return undefined;
    return allComments.find((comment) => comment.id === commentId)?.comment;
  };

  const processNewFens = () => {
    if (!user) return;
    // Reconstruct all the FENs we saw as the trainedFens state isn't updated
    // it misses the last move out due to the update sequence of State
    const seenFens = (() => {
      const newGame = new Chess();
      const fens = [] as TrainingFen[];

      // Add the starting position
      const commentId = currentLineMoves[0]?.comment?.id;
      fens.push({ fen: newGame.fen(), commentId });

      currentLineMoves.forEach((move) => {
        newGame.move(move.move);
        fens.push({
          fen: newGame.fen(),
          commentId: move.comment?.id,
        });
      });
      return fens;
    })();

    // To only upload the fens we haven't seen before
    // we need to check both the fen string, and the actual comment (not just the id)
    // Doing this here means we only need to store a single fen with one commentId in the DB
    const fensToUpload = seenFens.filter((seenFen) => {
      const fenComment = getComment(seenFen.commentId);
      const existingFen = existingFens.find((existingFen) => {
        const existingFenComment = getComment(existingFen.commentId);
        return (
          existingFen.fen === seenFen.fen && existingFenComment === fenComment
        );
      });
      return !existingFen;
    });

    const allSeenFens = [...existingFens, ...fensToUpload];
    setExistingFens(allSeenFens);

    if (fensToUpload.length > 0) {
      // This is not using await, because actually we want this to run in the background
      // and not block the user from continuing. If this errors, all it means is that the user
      // will have to re-do some moves, next time they train which isn't a big deal.
      fetch(`/api/courses/user/${userCourse.id}/fens/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fens: fensToUpload,
        }),
      })
        .then((resp) => resp.json() as Promise<ResponseJson>)
        .then((json) => {
          if (json.message !== 'Fens uploaded') {
            throw new Error(json.message);
          }
        })
        .catch((e: unknown) => Sentry.captureException(e)); // Don't do anything with the error, just log it
    }
  };

  const calculateRevisionData = (line: PrismaUserLine) => {
    // find the review date for the line
    const now = new Date();
    const tenMinutes = 10 * 60 * 1000;
    const oneHour = 6 * tenMinutes;
    const fourHours = 4 * oneHour;
    const oneDay = 24 * oneHour;
    const threeDays = oneDay * 3;
    const oneWeek = oneDay * 7;
    const oneMonth = oneDay * 30;
    const timeToAdd = lineCorrect
      ? (() => {
          switch (line.currentStreak) {
            case 0: // First time ever correct, or first time since wrong
              return oneHour;
            case 1:
              return fourHours;
            case 2:
              return oneDay;
            case 3:
              return threeDays;
            case 4:
              return oneWeek;
            default:
              return oneMonth;
          }
        })()
      : tenMinutes;

    return new Date(now.getTime() + timeToAdd);
  };

  const processStats = () => {
    if (!user || !currentLine) return null;

    const revisionDate = calculateRevisionData(currentLine);
    const optimisticallyUpdatedLine = { ...currentLine, revisionDate };
    const updatedLines = lines.map((line) =>
      line.id === optimisticallyUpdatedLine.id
        ? optimisticallyUpdatedLine
        : line,
    );
    setLines(updatedLines);

    // Send the update to the server in the background
    fetch(`/api/courses/user/${userCourse.id}/stats/${currentLine.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineCorrect,
        revisionDate,
      }),
    })
      .then((resp) => resp.json() as Promise<ResponseJson>)
      .then((json) => {
        if (json.message !== 'Stats updated') {
          throw new Error(json.message);
        }
        // Optionally handle the successful response
      })
      .catch((e: unknown) => {
        Sentry.captureException(e);
        // Revert to the previous state or handle the error
      });

    return updatedLines; // Return the optimistically updated lines
  };

  const handleMove = (playerMove: ChessMove) => {
    const correctMove =
      mode === 'normal'
        ? currentLineMoves[game.history().length - 1]?.move
        : wrongMoves[currentWrongMove]?.move;

    if (correctMove === undefined) throw new Error('No correct move found');

    if (correctMove !== playerMove.san) {
      // We played the wrong move
      setLineCorrect(false);
      setIncorrectCounter(incorrectCounter + 1);
      if (soundEnabled) incorrectSound();
      game.undo();
      setTimeout(() => {
        setPosition(game.fen());
      }, 300);
      setWrongFens([...wrongFens, game.fen()]);
      setWrongMoves([...wrongMoves, { move: correctMove, fen: game.fen() }]);
      makeTeachingMove(800);
      return false;
    }

    // We played the correct move
    setCorrectCounter(correctCounter + 1);
    if (mode === 'normal') {
      // log the previous fen as one we've seen and done right.
      game.undo();
      const commentId = currentLineMoves[game.history().length]?.comment?.id;
      const trainedFen = { fen: game.fen(), commentId };
      setTrainedFens((prevTrainedFens) => [...prevTrainedFens, trainedFen]);
      game.move(playerMove);

      // Update the position and continue
      setPosition(game.fen());
      playOpponentsMove();
    } else {
      // Remove the move from the wrong moves
      wrongMoves.splice(currentWrongMove, 1);
      setCurrentWrongMove(currentWrongMove + 1);
    }
    checkEndOfLine();
    return true;
  };

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const moveColour = index % 2 === 0 ? 'White' : 'Black';
    return nextLine ? (
      <button
        key={`${index}_pgn`}
        className="h-max max-h-fit bg-none px-1 py-1 hover:bg-purple-800"
        onClick={() => {
          const newGame = new Chess();
          for (let i = 0; i <= index; i++) {
            const move = game.history()[i];
            if (move) newGame.move(move);
          }
          setPosition(newGame.fen());
          setCurrentMove(currentLineMoves[index]);
        }}
      >
        <p>
          {moveColour === 'White' && (
            <span className="font-bold">{moveNumber}</span>
          )}{' '}
          <span>{move}</span>
        </p>
      </button>
    ) : (
      <div key={`${index}_pgn`} className="px-1 py-1">
        <p>
          {moveColour === 'White' && (
            <span className="font-bold">{moveNumber}</span>
          )}{' '}
          <span>{move}</span>
        </p>
      </div>
    );
  });

  // Here are all our useEffect functions
  useEffect(() => {
    // On mount, we need to get the first line
    const nextLine = getNextLine(lines);
    if (!nextLine) {
      // Nothing left to review/learn
      router.push('/training/courses/');
      return;
    }
    setCurrentLine(nextLine);
  }, []);

  useEffect(() => {
    // Create a new game when the line changes
    if (!currentLine) return;
    const newGame = new Chess();
    setGame(newGame);
    setGameReady(false);
    setCurrentLineMoves(currentLine.line.moves);
    setWrongMoves([]);
  }, [currentLine]);

  useEffect(() => {
    if (!currentLine || currentLineMoves.length === 0) return;
    const ourColour = currentLine.line.colour === 'White';
    const isOurMove = (move: PrismaMove) => move.colour === ourColour;
    const lastIndex = currentLineMoves.reduce(
      (lastIndex, move, currentIndex) => {
        return isOurMove(move) ? currentIndex : lastIndex;
      },
      -1,
    );

    setIndexOfOurLastMove(lastIndex);
  }, [currentLineMoves]);

  useEffect(() => {
    // We need to ensure the game is set before we can make a move
    setGameReady(true);
  }, [game]);

  useEffect(() => {
    // Now, whenever any of the elements associated with the game/line
    // change we can update the game and check if we need to make a teachingMove
    if (gameReady && currentLine) {
      setPosition(game.fen());
      const lineColour = currentLine.line.colour;
      setOrientation(lineColour === 'White' ? 'white' : 'black');

      let timeoutId: NodeJS.Timeout | undefined;
      if (lineColour === 'Black') {
        // If we're Black, we always need the first move to be played automatically
        // the playOpponentsMove function will handle the checks for what type (teaching or normal)
        // and also will then sort out our next move
        timeoutId = playOpponentsMove();
      } else if (lineColour === 'White' && needsTeachingMove()) {
        timeoutId = makeTeachingMove();
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [gameReady, game, currentLine]);

  useEffect(() => {
    setCurrentMove(currentLineMoves[game.history().length - 1]);
    const lastMove = game.history({ verbose: true })[game.history().length - 1];
    if (lastMove) {
      setHighlightSquares({
        [lastMove.to]: { backgroundColor: 'rgba(126,34,206, 0.3)' },
        [lastMove.from]: { backgroundColor: 'rgba(126,34,206, 0.3)' },
      });
    } else setHighlightSquares({});
  }, [game.history().length]);

  useEffect(() => {
    if (!currentMove) return;
    if ((teaching || nextLine) && currentMove.comment) setShowComment(true);
    else setShowComment(false);

    if (currentMove.arrows && teaching) {
      setArrows(getArrows(currentMove.arrows));
    } else {
      setArrows([]);
    }
  }, [currentMove]);

  useEffect(() => {
    if (!nextLine || !autoNext) return;
    startNextLine();
  }, [nextLine]);

  // Listen for spacebar as a way to press the "next" button
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (nextLine && !autoNext) startNextLine();
        if (teaching) resetTeachingMove();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [nextLine, autoNext, teaching]);

  // Last check to ensure we have a user
  if (!user) return null;

  return error ? (
    <div className="">
      <Heading as="h1" color="text-red-500">
        {error}
      </Heading>
      <p>
        Please try again later, or{' '}
        <StyledLink href="/contact/report-an-issue">report an issue</StyledLink>{' '}
        if the problem persists.
      </p>
    </div>
  ) : (
    <div className="relative border border-gray-300 bg-[rgba(0,0,0,0.03)] text-black shadow-md dark:border-slate-600 dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:shadow-slate-900">
      {loading ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[rgba(0,0,0,0.3)]">
          <Spinner />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-300 px-2 py-1 font-bold text-orange-500 dark:border-slate-600">
        <div className="flex flex-col gap-2">
          <p className="font-bold">{currentLine?.line.group.groupName}</p>
          <div className="flex flex-wrap gap-2 text-sm italic text-gray-600 dark:text-gray-400 md:gap-4 lg:gap-6">
            <p className="flex items-center gap-1">
              <svg
                className="text-orange-500"
                height="24"
                viewBox="0 0 32 32"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4"
                  fill="currentColor"
                />
                <path
                  d="M20.59 22L15 16.41V7h2v8.58l5 5.01z"
                  fill="currentColor"
                />
              </svg>
              <span>
                {
                  lines.filter(
                    (line) =>
                      line.revisionDate === null ||
                      line.revisionDate <= new Date(),
                  ).length
                }{' '}
                lines remaining
              </span>
            </p>
            <p className="flex items-center gap-1">
              <p className="mr-1">Moves:</p>
              <svg
                className="text-lime-500"
                height="16"
                viewBox="0 0 512 512"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2h144c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48h-97.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192h64c17.7 0 32 14.3 32 32v224c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-xs">{correctCounter} correct</span>
            </p>
            <p className="flex items-center gap-1">
              <svg
                className="text-red-500"
                height="16"
                viewBox="0 0 512 512"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2h144c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48h-97.5c-19 0-37.5 5.6-53.3 16.1l-38.5 25.7C176 91.6 160 121.6 160 153.7v111.2c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384h64c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-xs">{incorrectCounter} incorrect</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white">
          <ThemeSwitch />
          <button
            className="flex cursor-pointer flex-row items-center gap-2 hover:text-orange-500"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <Tippy content={`Sound ${soundEnabled ? 'On' : 'Off'}`}>
              {soundEnabled ? (
                <svg
                  height="24"
                  viewBox="0 0 16 16"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm9 .5s1 .5 1 1.75s-1 1.75-1 1.75"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                <svg
                  height="24"
                  viewBox="0 0 16 16"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm12.5 0l-3.5 4.5m0-4.5l3.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </Tippy>
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div>
          <ChessBoard
            enableArrows
            enableHighlights
            additionalArrows={arrows}
            additionalSquares={highlightSquares}
            game={game}
            moveMade={handleMove}
            orientation={orientation}
            position={position}
            readyForInput={interactive}
            soundEnabled={soundEnabled}
          />
          <XpTracker counter={xpCounter} type="line" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-2">
          {showComment ? (
            <p
              className=" overflow-y-auto bg-purple-900 p-2 text-sm"
              style={{
                maxHeight:
                  Math.min(windowSize.height / 1.75, windowSize.width - 50) *
                  0.5,
              }}
            >
              {currentMove?.comment?.comment}
            </p>
          ) : null}
          <div
            className="flex h-full flex-1 flex-wrap content-start gap-1 overflow-y-auto border border-purple-700 bg-purple-700 bg-opacity-20 p-2 text-black dark:text-white lg:border-4"
            style={{
              maxHeight: showComment
                ? Math.min(windowSize.height / 1.75, windowSize.width - 50) *
                  0.5
                : '100%',
            }}
          >
            {PgnDisplay.map((item) => item)}
          </div>
          <label
            htmlFor="autoNext"
            className="ml-auto flex items-center gap-2 text-sm"
          >
            <Toggle
              id="autoNext"
              defaultChecked={autoNext}
              onChange={() => {
                setAutoNext(!autoNext);
                if (nextLine) startNextLine();
              }}
            />
            <span>Auto Next on correct</span>
          </label>
          {teaching ? (
            <Button variant="primary" onClick={resetTeachingMove}>
              Got it!
            </Button>
          ) : null}
          {nextLine && !autoNext ? (
            <Button
              disabled={status === 'loading'}
              variant="primary"
              onClick={startNextLine}
            >
              Next Line {status === 'loading' && <Spinner />}
            </Button>
          ) : null}
          <Button
            variant="danger"
            onClick={() => router.push('/training/courses/')}
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
