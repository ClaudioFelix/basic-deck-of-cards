import React from 'react';
import { type useActiveGame } from '../../hooks/useActiveGame';
import './GameState.css';

type GameStateProps = ReturnType<typeof useActiveGame>;

export function GameState(props: GameStateProps): React.ReactElement {
  const {
    deckInfo,
    playerScores,
    players,
    removePlayer,
    fetchPlayerScores
  } = props;

  return (
    <div className="game-state">
      <h2>Game state</h2>
      <div className="deck-info">
        <h3>Deck information</h3>
        {deckInfo ? (
          <>
            <p><strong>Cards total:</strong> {deckInfo.totalCards}</p>
            <ul>
              {deckInfo.suitCounts && Object.entries(deckInfo.suitCounts).map(([suit, count]) => (
                <li key={suit}>{suit}: {count}</li>
              ))}
            </ul>
          </>
        ) : <p>Loading...</p>}
      </div>
      <div className="player-scores">
        <h3>Score (Higher to Lower)</h3>
        <button onClick={fetchPlayerScores}>Update scores</button>
        <ul>
          {playerScores.map(score => {
            const player = players.find(player => player.id === score.playerId);
            return (
              <li key={score.playerId}>
                {player? player.name : score.playerName}: <strong>{score.totalValue} points</strong>
                <button 
                  onClick={() => removePlayer(score.playerId)} 
                  className="delete-button-small"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}