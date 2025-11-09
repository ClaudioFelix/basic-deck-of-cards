import React from 'react';

import { type useActiveGame } from '../../hooks/useActiveGame';

type GameControlsProps = ReturnType<typeof useActiveGame>;

export function GameControls(props: GameControlsProps): React.ReactElement {

  const {
    players,
    selectedPlayer,
    dealAmount,
    newPlayerName,
    setNewPlayerName,
    setSelectedPlayer,
    setDealAmount,
    addDeck,
    shuffle,
    addPlayer,
    dealCards
  } = props;

  const handlePlayerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const player = players.find(player => player.id === e.target.value) || null
    setSelectedPlayer(player);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDealAmount(Number(e.target.value));
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlayerName(e.target.value);
  };

  return (
    <>
      <button onClick={addDeck}>Add a new deck</button>
      <button onClick={shuffle}>Shuffle deck</button>
      <div className="add-player-controls">
        <h3>New player</h3>
        <input 
          type="text"
          placeholder="Player name"
          value={newPlayerName}
          onChange={handlePlayerNameChange}
        />
        <button 
          onClick={addPlayer}
          disabled={!newPlayerName.trim()}
        >
          Add player
        </button>
      </div>

      {players.length > 0 && (
        <div className="deal-controls">
          <h3>Deal cards</h3>
          <select 
            value={selectedPlayer?.id || ''} 
            onChange={handlePlayerSelectChange}
          >
            <option value="">-- Select a player --</option>
            {players.map(player => (
              <option key={player.name} value={player.id}>{player.name}</option>
            ))}
          </select>
          <input 
            data-testid="deal-amount" 
            value={dealAmount} 
            onChange={handleAmountChange}
          />
          <button onClick={dealCards}>Deal</button>
        </div>
      )}
    </>
  );
}