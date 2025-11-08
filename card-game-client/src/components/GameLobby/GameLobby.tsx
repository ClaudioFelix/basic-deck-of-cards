import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import './GameLobby.css';

export function GameLobby(): React.ReactElement {
  const { 
    gameList, 
    createNewGame, 
    deleteGame, 
    setGameId, 
    fetchGameList 
  } = useGame();

  useEffect(() => {
    fetchGameList();
  },);

  return (
    <div className="controls-panel">
      <h2>Game Lobby</h2>
      <button onClick={createNewGame}>Create a new game</button>
      
      <h3>Available games</h3>
      <div className="game-list">
        {gameList.length === 0 && <p>No games were found.</p>}
        {gameList.map(game => (
          <div key={game.gameId} className="game-list-item">
            <span>ID: {game.gameId} ({game.playerCount} players)</span>
            <div>
              <button onClick={() => setGameId(game.gameId)}>Load game</button>
              <button onClick={() => deleteGame(game.gameId)} className="delete-button">Close game</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}