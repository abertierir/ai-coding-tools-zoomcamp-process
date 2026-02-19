import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, gameStarted, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key === ' ') {
        resetGame();
        return;
      }

      if (e.key === ' ' && gameStarted) {
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, gameStarted]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-green-800 mb-4 text-center">Snake Game</h1>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="text-2xl font-semibold text-green-700">
            Score: <span className="text-green-900">{score}</span>
          </div>
          {isPaused && gameStarted && (
            <div className="text-xl font-semibold text-orange-600">PAUSED</div>
          )}
        </div>

        <div 
          className="relative bg-green-50 border-4 border-green-800 rounded-lg"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? 'bg-green-700' : 'bg-green-600'} rounded-sm`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
              <div className="text-white text-3xl font-bold mb-4">Game Over!</div>
              <div className="text-white text-xl mb-4">Final Score: {score}</div>
              <button
                onClick={resetGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Start Screen */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
              <div className="text-white text-3xl font-bold mb-4">Snake Game</div>
              <button
                onClick={resetGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition text-xl"
              >
                Start Game
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-700">
          <div className="font-semibold mb-2">Controls:</div>
          <div className="text-sm">
            <div>Arrow Keys: Move</div>
            <div>Spacebar: {gameStarted ? 'Pause/Resume' : 'Start'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
