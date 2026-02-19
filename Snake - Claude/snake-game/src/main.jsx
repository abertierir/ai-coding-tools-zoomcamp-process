import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SnakeGame from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnakeGame />
  </StrictMode>,
)