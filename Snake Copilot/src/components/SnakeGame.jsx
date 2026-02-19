import React, { useState, useEffect, useCallback } from 'react'
import './SnakeGame.css'

const GRID_SIZE = 20
const INITIAL_SPEED = 100

const SnakeGame = () => {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ])
  
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState({ x: 0, y: -1 })
  const [nextDirection, setNextDirection] = useState({ x: 0, y: -1 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  // Generate random food position
  const generateFood = useCallback((snakeBody) => {
    let newFood
    let isOnSnake = true
    
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
      
      isOnSnake = snakeBody.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      )
    }
    
    return newFood
  }, [])

  // Initialize food
  useEffect(() => {
    setFood(generateFood(snake))
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && (e.key === ' ' || e.key === 'Enter')) {
        setGameStarted(true)
        setGameOver(false)
        return
      }

      if (gameOver && (e.key === ' ' || e.key === 'Enter')) {
        resetGame()
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 })
          e.preventDefault()
          break
        case 'ArrowDown':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 })
          e.preventDefault()
          break
        case 'ArrowLeft':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 })
          e.preventDefault()
          break
        case 'ArrowRight':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 })
          e.preventDefault()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameStarted, gameOver])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        // Update direction
        setDirection(nextDirection)
        
        // Calculate new head position
        const newHead = {
          x: prevSnake[0].x + nextDirection.x,
          y: prevSnake[0].y + nextDirection.y
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
            newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some(segment => 
            segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        let newSnake = [newHead, ...prevSnake]

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => prev + 10)
          setFood(generateFood(newSnake))
          setSpeed(prev => Math.max(50, prev - 2))
        } else {
          newSnake = newSnake.slice(0, -1)
        }

        return newSnake
      })
    }, speed)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, speed, nextDirection, food, generateFood])

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ])
    setDirection({ x: 0, y: -1 })
    setNextDirection({ x: 0, y: -1 })
    setScore(0)
    setGameStarted(false)
    setGameOver(false)
    setSpeed(INITIAL_SPEED)
    setFood(generateFood([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ]))
  }

  const renderCell = (x, y) => {
    if (snake.some(segment => segment.x === x && segment.y === y)) {
      const isHead = snake[0].x === x && snake[0].y === y
      return isHead ? 'cell head' : 'cell snake'
    }
    if (food.x === x && food.y === y) {
      return 'cell food'
    }
    return 'cell empty'
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🐍 Snake Game</h1>
        <div className="score-board">
          <div className="score">Score: <span>{score}</span></div>
          <div className="level">Level: <span>{Math.floor(score / 50) + 1}</span></div>
        </div>
      </div>

      <div className="game-board">
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className={renderCell(x, y)}
            />
          ))
        )}
      </div>

      <div className="game-info">
        {!gameStarted && !gameOver && (
          <div className="message">
            <p>Press SPACE or ENTER to Start</p>
            <p className="controls">Use Arrow Keys to Move</p>
          </div>
        )}
        
        {gameOver && (
          <div className="message game-over">
            <p>Game Over!</p>
            <p>Final Score: {score}</p>
            <p className="controls">Press SPACE or ENTER to Restart</p>
          </div>
        )}
        
        {gameStarted && !gameOver && (
          <div className="message playing">
            <p>🎮 Playing... Use Arrow Keys</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SnakeGame
