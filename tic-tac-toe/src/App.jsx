import { useState } from 'react';
import './App.css';

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ squares, xIsNext, onPlay, onNewGame }) {
  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const isGameOver = winner || isDraw;
  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) return;
    const next = squares.slice();
    next[i] = xIsNext ? 'X' : 'O';
    onPlay(next);
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board">
        {squares.map((val, i) => (
          <Square key={i} value={val} onClick={() => handleClick(i)} />
        ))}
      </div>
      {isGameOver && (
        <button className="new-game-btn" onClick={onNewGame}>
          New Game
        </button>
      )}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);

  const current = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  function handleNewGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={current} xIsNext={xIsNext} onPlay={handlePlay} onNewGame={handleNewGame} />
      </div>
      <div className="game-info">
        <h3>Move History</h3>
        <ol>
          {history.map((_, move) => (
            <li key={move}>
              <button
                className={move === currentMove ? 'history-btn current' : 'history-btn'}
                onClick={() => jumpTo(move)}
              >
                {move === 0 ? 'Go to start' : `Go to move #${move}`}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
