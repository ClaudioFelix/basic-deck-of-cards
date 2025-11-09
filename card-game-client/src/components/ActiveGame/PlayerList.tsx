import React from 'react';
import { type useActiveGame } from '../../hooks/useActiveGame';
import { CardComponent } from '../shared/CardComponent';
import './PlayerList.css';

type PlayerListProps = ReturnType<typeof useActiveGame>;

export function PlayerList(props: PlayerListProps): React.ReactElement {
  const { players, fetchPlayerHand } = props;

  return (
    <div className="player-hands">
      <h2>Player hands</h2>
      {players.map(player => (
        <div key={player.id} className="player-hand" data-testid="player-list-item">
          <h4>Player: {player.name}</h4>
          <div className="card-list">
            {player.hand.length > 0 ? (
              player.hand.map((card, index) => (
                <CardComponent key={index} card={card} />
              ))
            ) : (
              <p>(Empty hand)</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}