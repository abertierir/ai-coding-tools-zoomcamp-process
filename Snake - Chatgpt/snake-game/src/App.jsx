import React, { useEffect, useMemo, useRef, useState } from "react";

const GRID_SIZE = 20; // 20x20
const START_LENGTH = 4;

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function wrap(n, max) {
  if (n < 0) return max - 1;
  if (n >= max) return 0;
  return n;
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function cellKey(c) {
  return `${c.x},${c.y}`;
}

function randomEmptyCell(occupiedSet) {
  const empties = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const k = `${x},${y}`;
      if (!occupiedSet.has(k)) empties.push({ x, y });
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function makeInitialSnake() {
  // start centered, moving right
  const y = Math.floor(GRID_SIZE / 2);
  const xStart = Math.floor(GRID_SIZE / 2) - (START_LENGTH - 1);
  return Array.from({ length: START_LENGTH }, (_, i) => ({
    x: xStart + i,
    y,
  }));
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(() => makeInitialSnake());
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });

  const [food, setFood] = useState(() => {
    const s = makeInitialSnake();
    const occ = new Set(s.map(cellKey));
    return randomEmptyCell(occ);
  });

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const v = Number(localStorage.getItem("snake_best") || 0);
    return Number.isFinite(v) ? v : 0;
  });

  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Speed: starts slow-ish and ramps up
  const tickMs = useMemo(() => {
    const base = 150;
    const faster = Math.min(90, Math.floor(score * 3)); // max speed-up
    return base - faster;
  }, [score]);

  const boardRef = useRef(null);

  const occupiedSet = useMemo(() => new Set(snake.map(cellKey)), [snake]);

  const reset = () => {
    const s = makeInitialSnake();
    setSnake(s);
    setDir({ x: 1, y: 0 });
    nextDirRef.current = { x: 1, y: 0 };
    setScore(0);
    setPaused(false);
    setGameOver(false);
    const occ = new Set(s.map(cellKey));
    setFood(randomEmptyCell(occ));
    // focus board so arrow keys work immediately
    requestAnimationFrame(() => boardRef.current?.focus());
  };

  const placeFood = (newSnake) => {
    const occ = new Set(newSnake.map(cellKey));
    const f = randomEmptyCell(occ);
    setFood(f);
    // If no food spot exists, player filled the board => win
    if (!f) {
      setGameOver(true);
      setPaused(true);
    }
  };

  const requestDirection = (newDir) => {
    // Prevent reversing instantly (e.g., right -> left)
    const current = nextDirRef.current;
    if (isOpposite(newDir, current)) return;
    nextDirRef.current = newDir;
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!gameOver) setPaused((p) => !p);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        reset();
        return;
      }
      const d = DIRS[e.key];
      if (d) {
        e.preventDefault();
        requestDirection(d);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (paused || gameOver) return;

    const id = setInterval(() => {
      setSnake((prevSnake) => {
        const newDir = nextDirRef.current;
        setDir(newDir);

        const head = prevSnake[prevSnake.length - 1];
        const nextHead = {
          x: wrap(head.x + newDir.x, GRID_SIZE),
          y: wrap(head.y + newDir.y, GRID_SIZE),
        };

        // Determine if we eat
        const willEat = food && sameCell(nextHead, food);

        // Move: add new head
        const grown = [...prevSnake, nextHead];
        const nextSnake = willEat ? grown : grown.slice(1);

        // Collision with self:
        // If we didn't eat, tail moved away, so collision check should use nextSnake body excluding new head.
        const body = nextSnake.slice(0, nextSnake.length - 1);
        const hitSelf = body.some((c) => sameCell(c, nextHead));
        if (hitSelf) {
          setGameOver(true);
          setPaused(true);
          return prevSnake; // keep last safe frame
        }

        if (willEat) {
          setScore((s) => {
            const ns = s + 1;
            if (ns > best) {
              setBest(ns);
              localStorage.setItem("snake_best", String(ns));
            }
            return ns;
          });
          placeFood(nextSnake);
        }

        return nextSnake;
      });
    }, tickMs);

    return () => clearInterval(id);
  }, [paused, gameOver, tickMs, food, best]);

  // Make sure board is focusable for accessibility (optional)
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  const cellSize = 18;
  const boardPx = GRID_SIZE * cellSize;

  const head = snake[snake.length - 1];
  const snakeSet = occupiedSet;

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <h1 style={styles.title}>Snake (React)</h1>

        <div style={styles.stats}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Score</div>
            <div style={styles.statValue}>{score}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Best</div>
            <div style={styles.statValue}>{best}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Speed</div>
            <div style={styles.statValue}>{Math.round(1000 / tickMs)}/s</div>
          </div>
        </div>

        <div
          ref={boardRef}
          tabIndex={0}
          role="application"
          aria-label="Snake game board"
          style={{
            ...styles.board,
            width: boardPx,
            height: boardPx,
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const k = `${x},${y}`;

            const isFood = food && food.x === x && food.y === y;
            const isSnake = snakeSet.has(k);
            const isHead = head && head.x === x && head.y === y;

            return (
              <div
                key={k}
                style={{
                  ...styles.cell,
                  ...(isSnake ? styles.snake : null),
                  ...(isHead ? styles.head : null),
                  ...(isFood ? styles.food : null),
                }}
              />
            );
          })}

          {(paused || gameOver) && (
            <div style={styles.overlay}>
              <div style={styles.overlayCard}>
                <div style={styles.overlayTitle}>
                  {gameOver ? "Game Over" : "Paused"}
                </div>
                <div style={styles.overlayText}>
                  {gameOver ? "Press R to restart." : "Press Space to resume."}
                </div>
                <div style={styles.overlayRow}>
                  <button style={styles.btn} onClick={() => setPaused((p) => !p)} disabled={gameOver}>
                    {paused ? "Resume" : "Pause"}
                  </button>
                  <button style={styles.btnPrimary} onClick={reset}>
                    Restart (R)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.controls}>
          <button
            style={styles.btn}
            onClick={() => {
              if (!gameOver) setPaused((p) => !p);
              boardRef.current?.focus();
            }}
          >
            {paused ? "Resume" : "Pause"} (Space)
          </button>
          <button style={styles.btnPrimary} onClick={reset}>
            Restart (R)
          </button>
        </div>

        <div style={styles.dpadWrap}>
          <div style={styles.dpadRow}>
            <button style={styles.dpad} onClick={() => requestDirection({ x: 0, y: -1 })}>
              ↑
            </button>
          </div>
          <div style={styles.dpadRow}>
            <button style={styles.dpad} onClick={() => requestDirection({ x: -1, y: 0 })}>
              ←
            </button>
            <button style={styles.dpad} onClick={() => requestDirection({ x: 0, y: 1 })}>
              ↓
            </button>
            <button style={styles.dpad} onClick={() => requestDirection({ x: 1, y: 0 })}>
              →
            </button>
          </div>
          <div style={styles.hint}>
            Controls: Arrow keys / WASD • Space = pause • R = restart
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0b1020",
    color: "#e9ecff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
    padding: 16,
  },
  panel: {
    width: "min(720px, 100%)",
    display: "grid",
    gap: 12,
    justifyItems: "center",
  },
  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: 0.5,
  },
  stats: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statBox: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    minWidth: 110,
    textAlign: "center",
  },
  statLabel: { fontSize: 12, opacity: 0.8 },
  statValue: { fontSize: 18, fontWeight: 700, marginTop: 2 },

  board: {
    position: "relative",
    outline: "none",
    display: "grid",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 10,
    boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
  },
  cell: {
    width: 18,
    height: 18,
    boxSizing: "border-box",
    borderRadius: 5,
    border: "1px solid rgba(255,255,255,0.03)",
    background: "rgba(255,255,255,0.02)",
  },
  snake: {
    background: "rgba(120, 200, 255, 0.9)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  head: {
    background: "rgba(160, 255, 140, 0.95)",
  },
  food: {
    background: "rgba(255, 120, 160, 0.95)",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.45)",
    borderRadius: 14,
  },
  overlayCard: {
    background: "rgba(20, 26, 48, 0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    minWidth: 260,
    textAlign: "center",
  },
  overlayTitle: { fontSize: 20, fontWeight: 800, marginBottom: 6 },
  overlayText: { fontSize: 13, opacity: 0.9, marginBottom: 12 },
  overlayRow: { display: "flex", gap: 10, justifyContent: "center" },

  controls: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btn: {
    background: "rgba(255,255,255,0.08)",
    color: "#e9ecff",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnPrimary: {
    background: "rgba(160, 255, 140, 0.9)",
    color: "#0b1020",
    border: "1px solid rgba(0,0,0,0.18)",
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
  },

  dpadWrap: {
    display: "grid",
    gap: 8,
    justifyItems: "center",
    marginTop: 6,
    opacity: 0.95,
  },
  dpadRow: { display: "flex", gap: 8 },
  dpad: {
    width: 48,
    height: 42,
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    color: "#e9ecff",
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
  },
  hint: { fontSize: 12, opacity: 0.75, textAlign: "center" },
};