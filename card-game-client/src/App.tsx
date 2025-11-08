import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Card,
  Player,
  DeckInfo,
  PlayerScore,
  PlayerScoreResponseDto,
  AddPlayerRequestDto,
  DealRequestDto,
  GameDto,
  AddPlayerResponseDto,
  GameSummaryDto } from './types/api';
import { addDeck, addPlayer, createGame, dealCards, deleteGame, getDeckInfo, getGameList, getPlayerHand, getPlayerScores, removePlayer, shuffle } from './services/gameApi';

type CardProps = {
  card: Card;
};

function CardComponent({card}: CardProps): React.ReactElement {
  return (
    <span className="card">
      {card.rank} of {card.suit}
    </span>
  );
}

function App() {

  const [gameList, setGameList] = useState<GameSummaryDto[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckInfo, setDeckInfo] = useState<DeckInfo | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState<string>('Player');
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [dealAmount, setDealAmount] = useState<number>(1);
  const [message, setMessage] = useState<string>('Welcome! Create a new game to start.');


  const fetchGameList = async () => {
    try {
      const data: GameSummaryDto[] = await getGameList();
      setGameList(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleCreateGame = async () => {
    try {
      setMessage('Creating a new game...');
      const data: GameDto = await createGame();
      setGameId(data.id);
      setMessage(`Game created: ${data.id}. Add decks and players.`);
      fetchGameList();
      setPlayers([]);
      setDeckInfo(null);
      setSelectedPlayer(null);

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleDeleteGame = async (idToDelete: string) => {
    if (!window.confirm(`Are you sure you want to close the game ${idToDelete}?`)) {
      return;
    }
    try {
      deleteGame(idToDelete)
      setMessage(`Game ${idToDelete} closed.`);
      fetchGameList();

      if (gameId === idToDelete) {
        setGameId(null);
      }
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };  

  const handleRemovePlayer = async (playerId: string) => {
    const player = players.find(player => player.id === playerId);
    const playerName = player? player.name : playerId;
    if(!gameId){
      setMessage(`Please select a game.`);
      return
    }
    if (!window.confirm(`Are you sure you want to remove player ${playerName}?`)) {
      return;
    }
    try {
      await removePlayer(gameId, playerId);

      setMessage(`Player ${playerName} removed.`);
      fetchPlayerScores(); 
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };

  const handleAddStandardDeck = async () => {
    if (!gameId) {
      setMessage('Create a game before adding a deck');
      return;
    }
    try {
      await addDeck(gameId);
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
      shuffle(gameId)
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
      const data: AddPlayerResponseDto = await addPlayer(gameId, playerName);
      const newPlayer: Player = { id: data.id, name: newPlayerName, hand: [] };
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      
      setMessage(`Player ${newPlayerName} added.`);
      setNewPlayerName('');

      if (players.length === 0) {
        setSelectedPlayer(newPlayer);
      }
      fetchPlayerScores()
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };

  const handleDealCards = async () => {
    if (!gameId) {
      setMessage('Load a game before dealing cards.');
      return;
    }
    if (!selectedPlayer) {
      setMessage('Please select a player for dealing cards.');
      return;
    }

    try {
      const dealtCards: Card[] = await dealCards(gameId, selectedPlayer.id, dealAmount);
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
      const data: DeckInfo = await getDeckInfo(gameId);
      setDeckInfo(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const fetchPlayerScores = async () => {
    if (!gameId) return;
    try {
      const data: PlayerScoreResponseDto[] = await getPlayerScores(gameId);
      setPlayerScores(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const fetchPlayerHand = async (playerId: string) => {
    if (!gameId) return;
    try {
      const handData: Card[] = await getPlayerHand(gameId, playerId);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === playerId ? { ...player, hand: handData } : player
        )
      );
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

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

  useEffect(() => {
    fetchGameList();
  },);

  useEffect(() => {
    if (gameId) {
      setMessage(`Game ${gameId} loaded.`);
      fetchDeckInfo();
      fetchPlayerScores();
    } else {
      setMessage('Welcome! Create or select a game.');
      setPlayers([]);
      setDeckInfo(null);
      setPlayerScores([]);
      setSelectedPlayer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Card Game Client</h1>
        <p className="message">
          <strong>Status:</strong> {message}
        </p>
      </header>

      <div className="controls-panel">
        <h2>Game Lobby</h2>
        <button onClick={handleCreateGame}>Create a new game</button>
        
        <h3>Available games</h3>
        <div className="game-list">
          {gameList.length === 0 && <p>No games were found.</p>}
          {gameList.map(game => (
            <div key={game.gameId} className="game-list-item">
              <span>ID: {game.gameId} ({game.playerCount} players)</span>
              <div>
                <button onClick={() => setGameId(game.gameId)}>Load game</button>
                <button onClick={() => handleDeleteGame(game.gameId)} className="delete-button">Close game</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-container">
        <div className="controls-panel">
          <h2>Game Configuration</h2>
          
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
                onChange={handlePlayerSelectChange}
              >
                <option value="">-- Select a player --</option>
                {players.map(player => (
                  <option key={player.name} value={player.id}>{player.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={dealAmount} 
                onChange={handleAmountChange}
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
                  {playerScores.map(score => {
                    const player = players.find(player => player.id === score.playerId);
                    return (
                      <li key={score.playerId}>
                        {player? player.name : score.playerName}: <strong>{score.totalValue} points</strong>
                        <button 
                          onClick={() => handleRemovePlayer(score.playerId)} 
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
