import { useState, useEffect, useCallback } from 'react';
import { Player, DeckInfo, PlayerScore, Card, PlayerScoreResponseDto, AddPlayerResponseDto } from '../types/api';
import * as gameApi from '../services/gameApi';
import { useGame } from '../context/GameContext';
import { emptyDeckInfo } from '../assets/emptyDeck';

export function useActiveGame(gameId: string | null) {

  const { setMessage } = useGame();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckInfo, setDeckInfo] = useState<DeckInfo>(emptyDeckInfo);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [dealAmount, setDealAmount] = useState<number>(0);

  const fetchDeckInfo = useCallback(async () => {
    if (!gameId) return;
    try {
      const data: DeckInfo = await gameApi.getDeckInfo(gameId);
      setDeckInfo(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  }, [gameId, setMessage]);

  const fetchPlayerScores = useCallback(async () => {
    if (!gameId) return;
    try {
      const data: PlayerScoreResponseDto[] = await gameApi.getPlayerScores(gameId);
      setPlayerScores(data);

      setPlayers(prevPlayers => {
        return data.map(score => {
          const existingPlayer = prevPlayers.find(player => player.id === score.playerId);
          if(existingPlayer) return existingPlayer;

          return  {
            id: score.playerId,
            name: score.playerName,
            hand: []
          };
        });
      });
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  }, [gameId, setMessage]);

  const fetchPlayerHand = useCallback(async (playerId: string) => {
    if (!gameId) return;
    try {
      const handData: Card[] = await gameApi.getPlayerHand(gameId, playerId);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === playerId ? { ...player, hand: handData } : player
        )
      );
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  }, [gameId, setMessage]);

  useEffect(() => {
    if (gameId) {
      setMessage(`Game ${gameId} loaded.`);
      fetchDeckInfo();
      fetchPlayerScores();
    } else {
      setMessage('Welcome! Create or select a game.');
      setPlayers([]);
      setDeckInfo(emptyDeckInfo);
      setPlayerScores([]);
      setSelectedPlayer(null);
    }
  }, [gameId]);

  const addDeck = async () => {
    if (!gameId) {
      setMessage('Create a game before adding a deck');
      return;
    }
    try {
      await gameApi.addDeck(gameId);
      setMessage('A standard deck of 52 cards was added.');
      await fetchDeckInfo();
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };  

  const shuffle = async () => {
    if (!gameId) {
      setMessage('Create a game before shuffling.');
      return;
    }
    try {
      await gameApi.shuffle(gameId)
      setMessage('Deck shuffled.');
      await fetchDeckInfo();
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };  

  const addPlayer = async () => {
    if (!gameId) {
      setMessage('Create a game before adding players.');
      return;
    }
    if (!newPlayerName.trim()) {
      setMessage('Insert a name for the player.');
      return;
    }
    try {
      const data: AddPlayerResponseDto = await gameApi.addPlayer(gameId, newPlayerName);
      const newPlayer: Player = { id: data.id, name: newPlayerName, hand: [] };
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      setPlayerScores(prevScores => [...prevScores, {playerId: data.id, playerName: newPlayerName, totalValue: 0}])
      setMessage(`Player ${newPlayerName} added.`);
      setNewPlayerName('');

      if (players.length === 0) {
        setSelectedPlayer(newPlayer);
      }
      
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };

  const removePlayer = async (playerId: string) => {
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
      await gameApi.removePlayer(gameId, playerId);

      setMessage(`Player ${playerName} removed.`);
      await fetchPlayerScores(); 
    } catch (error) {
      setMessage(`Erro: ${(error as Error).message}`);
    }
  };

  const dealCards = async () => {
    if (!gameId) {
      setMessage('Load a game before dealing cards.');
      return;
    }
    if (!selectedPlayer) {
      setMessage('Please select a player for dealing cards.');
      return;
    }

    try {
      const dealtCards: Card[] = await gameApi.dealCards(gameId, selectedPlayer.id, dealAmount);
      setMessage(`${dealtCards.length} cards dealt to ${selectedPlayer.name}.`);

      await fetchPlayerHand(selectedPlayer.id);
      await fetchDeckInfo();
      await fetchPlayerScores();

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  return {
    players,
    deckInfo,
    playerScores,
    selectedPlayer,
    dealAmount,
    newPlayerName,
    setNewPlayerName,
    setSelectedPlayer,
    setDealAmount,
    addDeck,
    shuffle,
    addPlayer,
    removePlayer,
    dealCards,
    fetchPlayerHand,
    fetchPlayerScores,
  };
}