import React, { useState, useEffect } from 'react';
import './App.css';
import { Card, Player, DeckInfo, PlayerScore, PlayerScoreResponseDto, AddPlayerRequestDto, DealRequestDto, GameDto, AddPlayerResponseDto } from './types/api';

type CardProps = {
  card: Card; // Agora podemos usar o tipo 'Card' diretamente
};

function CardComponent({card}: CardProps): React.ReactElement {
  return (
    <span className="card">
      {card.rank} of {card.suit}
    </span>
  );
}

function App() {

  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckInfo, setDeckInfo] = useState<DeckInfo | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState<string>('Player');
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [dealAmount, setDealAmount] = useState<number>(1);
  const [message, setMessage] = useState<string>('Welcome! Create a new game to start.');

  const API_URL = 'http://localhost:8080';

  const handleCreateGame = async () => {
    try {
      setMessage('Creating a new game...');
      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
      });
      
      if (response.status !== 201) {
        throw new Error(`Failed to create game: ${response.statusText}`);
      }

      const data: GameDto = await response.json();
      setGameId(data.id);
      setMessage(`Game created: ${data.id}. Add decks and players.`);
      
      setPlayers([]);
      setDeckInfo(null);
      setSelectedPlayer(null);

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleAddStandardDeck = async () => {
    if (!gameId) {
      setMessage('Create a game before adding a deck');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/add-deck`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to add a deck');
      setMessage('A standard deck of 52 cards was added.');
      fetchDeckInfo();
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };  

  const handleShuffle = async () => {
    if (!gameId) {
      setMessage('Create a game before shuffling.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/shuffle`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to shuffle');
      setMessage('Deck shuffled.');
      fetchDeckInfo();
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };  

  const handleAddPlayer = async () => {
    if (!gameId || !newPlayerName.trim()) {
      setMessage('Create a game before adding players.');
      return;
    }
    try {

      const addPlayerRequest: AddPlayerRequestDto = {
        name: playerName
      }
      const response = await fetch(`${API_URL}/games/${gameId}/players`, {
        method: 'POST',
                headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addPlayerRequest)
      });
      
      if (response.status !== 201) {
        throw new Error('Failed to add a player');
      }

      const data: AddPlayerResponseDto = await response.json();
      const newPlayer: Player = { id: data.id, name: newPlayerName, hand: [] };
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      
      setMessage(`Player ${newPlayerName} added.`);
      setNewPlayerName('');

      if (players.length === 0) {
        setSelectedPlayer(newPlayer);
      }
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };

  const handleDealCards = async () => {
    if (!selectedPlayer) {
      setMessage('Please select a player for dealing cards.');
      return;
    }

    try {
      const dealRequest: DealRequestDto = {
        playerId: selectedPlayer.id,
        amount: dealAmount
      };

      const response = await fetch(`${API_URL}/games/${gameId}/deal-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealRequest)
      });

      if (response.status !== 201) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deal cards');
      }

      const dealtCards = await response.json();
      setMessage(`${dealtCards.length} cards dealt to ${selectedPlayer.name}.`);

      fetchPlayerHand(selectedPlayer.id);
      fetchDeckInfo();
      fetchPlayerScores();

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const fetchDeckInfo = async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/deck`);
      if (!response.ok) throw new Error('Failed to get deck data');
      const data: DeckInfo = await response.json();
      setDeckInfo(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const fetchPlayerScores = async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/players`);
      if (!response.ok) throw new Error('Failed to retrieve player scores');
      const data: PlayerScoreResponseDto[] = await response.json();
      setPlayerScores(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const fetchPlayerHand = async (playerId: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/players/${playerId}/cards`);
      if (!response.ok) throw new Error(`Failed to retrieve the hand from player ${playerId}`);
      const handData: Card[] = await response.json();
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === playerId ? { ...player, hand: handData } : player
        )
      );
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    // Esta função será executada sempre que 'gameId' mudar
    if (gameId) {
      fetchDeckInfo();
      fetchPlayerScores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const findPlayer = (playerId: string) => {
    return players.find(player => player.id === playerId) || null
  }

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlayerName(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Card Game Client</h1>
        <p className="message">
          <strong>Status:</strong> {message}
        </p>
      </header>

      <div className="game-container">
        <div className="controls-panel">
          <h2>Game Configuration</h2>
          <button onClick={handleCreateGame}>Create a new game</button>
          
          {gameId && (
            <>
              <p><strong>Current Game ID:</strong> {gameId}</p>
              <button onClick={handleAddStandardDeck}>Add a new deck</button>
              <button onClick={handleShuffle}>Shuffle deck</button>
              <div className="add-player-controls">
                <h3>Add player</h3>
                <input 
                  type="text"
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={handlePlayerNameChange}
                />
                <button 
                  onClick={handleAddPlayer}
                  disabled={!newPlayerName.trim()}
                >
                  Add
                </button>
              </div>
            </>
          )}

          {players.length > 0 && (
            <div className="deal-controls">
              <h3>Deal cards</h3>
              <select 
                value={selectedPlayer?.id || ''} 
                onChange={(e) => setSelectedPlayer(findPlayer(e.target.value))}
              >
                <option value="">-- Select a player --</option>
                {players.map(player => (
                  <option key={player.name} value={player.id}>{player.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={dealAmount} 
                onChange={(e) => setDealAmount(Number(e.target.value))}
                min="1"
              />
              <button onClick={handleDealCards}>Deal</button>
            </div>
          )}
        </div>

        {gameId && (
          <div className="state-panel">
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
                  {playerScores.map(score => (
                    <li key={score.playerId}>
                      {score.playerId}: <strong>{score.totalValue} points</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="player-hands">
              <h2>Player hands</h2>
              {players.map(player => (
                <div key={player.id} className="player-hand">
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
          </div>
        )}
      </div>
    </div>
  );  
}



export default App;
