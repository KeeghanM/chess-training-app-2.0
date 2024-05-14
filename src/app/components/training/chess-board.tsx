'use client';

import { useWindowSize } from '@uidotdev/usehooks';
import type { Chess, Move, Piece, Square } from 'chess.js';
import { useAudio } from '@/app/hooks/use-audio';
import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type {
  Arrow,
  PromotionPieceOption,
} from 'react-chessboard/dist/chessboard/types';

interface ChessBoardProps {
  game: Chess;
  position: string;
  orientation: 'white' | 'black';
  readyForInput: boolean;
  soundEnabled: boolean;
  additionalSquares: Record<string, { backgroundColor: string }>;
  additionalArrows: Arrow[];
  enableArrows: boolean;
  enableHighlights: boolean;
  moveMade: null | ((move: Move) => void);
}
export function ChessBoard({
  game,
  position,
  orientation,
  readyForInput,
  soundEnabled,
  additionalSquares,
  additionalArrows,
  enableArrows,
  enableHighlights,
  moveMade,
}: ChessBoardProps) {
  // Board State
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [startSquare, setStartSquare] = useState<Square>();
  const [clickedPiece, setClickedPiece] = useState<Piece>();
  const [moveTo, setMoveTo] = useState<Square | undefined>();
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [arrows] = useState<Arrow[]>([]);

  // Setup SFX
  const checkSound = useAudio('/sfx/check.mp3');
  const captureSound = useAudio('/sfx/capture.mp3');
  const promotionSound = useAudio('/sfx/promote.mp3');
  const castleSound = useAudio('/sfx/castle.mp3');
  const moveSound = useAudio('/sfx/move.mp3');

  const playMoveSound = (move: string) => {
    if (!soundEnabled) return;

    if (move.includes('+')) {
      checkSound();
    } else if (move.includes('x')) {
      captureSound();
    } else if (move.includes('=')) {
      promotionSound();
    } else if (move.includes('O')) {
      castleSound();
    } else {
      moveSound();
    }
  };

  const checkPromotion = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: string,
  ) => {
    // CHECK IF LAST POSITION, BASED ON SOURCE SQUARE, IS A PAWN
    // This works because we haven't actually made the move yet
    const lastMovePiece = game.get(sourceSquare);
    const sourceCol = sourceSquare.split('')[0];
    const targetCol = targetSquare.split('')[0];
    const targetRank = targetSquare.split('')[1];
    const pieceString = piece as unknown as string; // Hacky cause Chess.js types are wrong
    const pieceColor = pieceString.split('')[0];
    const pieceType = pieceString.split('')[1];

    if (
      lastMovePiece.type === 'p' &&
      ((pieceColor === 'w' && targetRank === '8' && sourceCol === targetCol) ||
        (pieceColor === 'b' && targetRank === '1' && sourceCol === targetCol))
    ) {
      return pieceType?.toLowerCase();
    }
    return undefined;
  };

  const handlePieceDrop = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: string,
    promotion?: boolean,
  ) => {
    // Make the move to see if it's legal
    const playerMove = (() => {
      try {
        const from = sourceSquare ?? startSquare;
        const to = targetSquare ?? moveTo;
        const promotionPiece = promotion
          ? piece.split('')[1]!.toLowerCase()
          : checkPromotion(from, to, piece);

        const move = game.move({
          from,
          to,
          promotion: promotionPiece,
        });
        return move;
      } catch (e) {
        return null;
      }
    })();

    if (playerMove === null) return false; // invalid move

    setStartSquare(undefined);
    setClickedPiece(undefined);
    setMoveTo(undefined);
    setShowPromotionDialog(false);
    setOptionSquares({});
    if (moveMade) moveMade(playerMove);
    return true;
  };

  const handleSquareClick = (clickedSquare: Square) => {
    if (!readyForInput) return;

    const piece = game.get(clickedSquare);
    // if we click the same square twice
    // then unselect the piece
    if (startSquare === clickedSquare) {
      setStartSquare(undefined);
      setClickedPiece(undefined);
      return;
    }

    // if we click our own piece
    // then set the start square and clicked piece
    // (highlighting is handled by a useEffect)
    if (piece.color === game.turn()) {
      setStartSquare(clickedSquare);
      setClickedPiece(piece);
      return;
    }

    // If this is our second click, we check if we need to show the promotion dialog
    if (startSquare && clickedPiece) {
      const availableMove = game
        .moves({ square: startSquare, verbose: true })
        .find((move) => move.to === clickedSquare);
      if (!availableMove) return;

      // Check if this is a promotion move
      if (
        (clickedPiece.color === 'w' &&
          clickedPiece.type === 'p' &&
          clickedSquare[1] === '8') ||
        (clickedPiece.color === 'b' &&
          clickedPiece.type === 'p' &&
          clickedSquare[1] === '1')
      ) {
        setShowPromotionDialog(true);
        setMoveTo(clickedSquare);
        return;
      }

      // Otherwise, make the move
      handlePieceDrop(
        startSquare,
        clickedSquare,
        clickedPiece.type + clickedPiece.color,
      );
    }
  };

  const handlePromotionSelection = (
    selectedPiece: PromotionPieceOption | undefined,
  ) => {
    if (!selectedPiece || !moveTo) return false;

    setShowPromotionDialog(false);
    handlePieceDrop(startSquare!, moveTo, selectedPiece, true);
    return true;
  };

  useEffect(() => {
    if (!startSquare || !clickedPiece) {
      setOptionSquares({});
      return;
    }
    const validMoves = game.moves({ square: startSquare, verbose: true });
    const newOptions: Record<string, React.CSSProperties> = {};
    // Highlight the start square
    newOptions[startSquare] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    if (validMoves.length === 0) {
      setOptionSquares(newOptions);
      return;
    }
    // Highlight the valid moves
    validMoves.map((move) => {
      newOptions[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(startSquare).color
            ? 'radial-gradient(circle, transparent 50%,  rgba(0, 0, 0, 0.2) 51%,  rgba(0, 0, 0, 0.2) 65%,transparent 66%)'
            : 'radial-gradient(circle, rgba(0,0,0,.2) 20%, transparent 22%)',
        borderRadius: '50%',
        cursor: 'pointer',
      };
      return move;
    });
    setOptionSquares(newOptions);
  }, [startSquare, clickedPiece]);

  useEffect(() => {
    if (!soundEnabled) return;
    const lastMove = game.history({ verbose: true }).slice(-1)[0];
    if (!lastMove) return;
    playMoveSound(lastMove.san);
  }, [position]);

  const windowSize = useWindowSize();

  return (
    <div className="m-2">
      <Chessboard
        arePiecesDraggable={readyForInput}
        boardOrientation={orientation}
        position={position}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
        boardWidth={Math.min(
          (windowSize.height ?? 800) * 0.7,
          (windowSize.width ?? 300) * 0.9,
        )}
        customArrows={enableArrows ? [...additionalArrows, ...arrows] : []}
        customBoardStyle={{
          marginInline: 'auto',
        }}
        customSquareStyles={
          enableHighlights ? { ...optionSquares, ...additionalSquares } : {}
        }
        onPieceDrop={handlePieceDrop}
        onPromotionPieceSelect={handlePromotionSelection}
        onSquareClick={handleSquareClick}
        onDragOverSquare={(square) => {
          if (!startSquare) {
            setStartSquare(square);
          }
          setMoveTo(square);
        }}
        onSquareRightClick={() => {
          setStartSquare(undefined);
          setClickedPiece(undefined);
        }}
      />
    </div>
  );
}
