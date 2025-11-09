import React from 'react';
import { useGame } from '../../context/GameContext';
import { useActiveGame } from '../../hooks/useActiveGame';
import { GameControls } from './GameControls';
import { GameState } from './GameState';
import { PlayerList } from './PlayerList';
import './ActiveGame.css';

export function ActiveGameDashboard(): React.ReactElement {
  const { gameId, setGameId } = useGame();
  
  const game = useActiveGame(gameId);

  return (
    <div className="game-container">
      <div className="controls-panel">
        <h2>Game Configuration</h2>
        {gameId && (
          <>
            <p data-testid="current-game-id"><strong>Current Game ID:</strong> {gameId}</p>
            <button onClick={() => setGameId(null)} className="close-button">Close game</button>
            <hr/>
            <GameControls {...game} />
            <div className="state-panel">
              <GameState {...game} />
              <PlayerList {...game} />
            </div>
          </>
        )}
      </div>      
    </div>
  )
}