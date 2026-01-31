import { useEffect, useState, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  pieceCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#8B5CF6', // Primary purple
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#14B8A6', // Teal
];

const generatePieces = (count: number): ConfettiPiece[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // % from left
    y: -10 - Math.random() * 20, // Start above viewport
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 8 + Math.random() * 8,
    delay: Math.random() * 0.5,
    duration: 2.5 + Math.random() * 1.5,
    shape: ['square', 'circle', 'star'][Math.floor(Math.random() * 3)] as 'square' | 'circle' | 'star',
  }));
};

const ConfettiPiece = memo(({ piece }: { piece: ConfettiPiece }) => {
  const shapeStyles = {
    square: {
      borderRadius: '2px',
    },
    circle: {
      borderRadius: '50%',
    },
    star: {
      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    },
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${piece.x}%`,
        top: `${piece.y}%`,
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.color,
        transform: `rotate(${piece.rotation}deg)`,
        animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
        opacity: 0,
        ...shapeStyles[piece.shape],
      }}
    />
  );
});

ConfettiPiece.displayName = 'ConfettiPiece';

/**
 * Confetti - Celebratory confetti animation
 * 
 * Features:
 * - Multiple colorful pieces
 * - Various shapes (square, circle, star)
 * - Randomized fall patterns
 * - Performance optimized with CSS animations
 */
export const Confetti = memo(({ 
  isActive, 
  duration = 3000, 
  pieceCount = 50,
  onComplete 
}: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces(pieceCount));
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setPieces([]);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, pieceCount, onComplete]);

  if (!isVisible || pieces.length === 0) return null;

  return createPortal(
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              opacity: 1;
              transform: translateY(0) rotate(0deg) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(100vh) rotate(720deg) scale(0.5);
            }
          }
        `}
      </style>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} />
      ))}
    </div>,
    document.body
  );
});

Confetti.displayName = 'Confetti';

/**
 * useConfetti - Hook to trigger confetti from anywhere
 */
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback((duration = 3000) => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), duration);
  }, []);

  const ConfettiComponent = useCallback(() => (
    <Confetti isActive={isActive} onComplete={() => setIsActive(false)} />
  ), [isActive]);

  return { trigger, isActive, ConfettiComponent };
}

export default Confetti;

