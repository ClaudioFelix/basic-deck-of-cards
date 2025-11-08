import { AddPlayerRequestDto, AddPlayerResponseDto, Card, DealRequestDto, DeckInfo, GameDto, GameSummaryDto, PlayerScoreResponseDto } from "../types/api";

const API_URL = 'http://localhost:8080';

export const getGameList = async (): Promise<GameSummaryDto[]> => {
  const response = await fetch(`${API_URL}/games`);
  if (!response.ok) throw new Error('Failed to fetch games list');
  return await response.json();
};

export const createGame = async (): Promise<GameDto> => {
  const response = await fetch(`${API_URL}/games`, {
                                method: 'POST',
                              });
  if (response.status !== 201) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  return response.json();
}

export const deleteGame = async (idToDelete: string): Promise<void> => {
  const response = await fetch(`${API_URL}/games/${idToDelete}`, {
                                method: 'DELETE',
                              });
  if (!response.ok) throw new Error('Failed to close game');
}

export const removePlayer = async (gameId: string, playerId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/games/${gameId}/players/${playerId}`, {
                                method: 'DELETE',
                              });
  if (!response.ok) throw new Error('Failed to remove player');
}

export const addDeck = async (gameId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/games/${gameId}/add-deck`, {
                                method: 'POST',
                              });
  if (!response.ok) throw new Error('Failed to add a deck');
}

export const shuffle = async (gameId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/games/${gameId}/shuffle`, {
                                method: 'POST',
                              });
  if (!response.ok) throw new Error('Failed to shuffle');
}

export const addPlayer = async (gameId: string, playerName: string): Promise<AddPlayerResponseDto> => {
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

  return response.json()
}

export const dealCards = async (gameId: string, playerId: string, dealAmount: number): Promise<Card[]> => {
  const dealRequest: DealRequestDto = {
    playerId: playerId,
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
  return response.json();
} 

export const getDeckInfo = async (gameId: string): Promise<DeckInfo> => {
  const response = await fetch(`${API_URL}/games/${gameId}/deck`);
  if (!response.ok) throw new Error('Failed to get deck data');
  return response.json()
}

export const getPlayerScores = async (gameId: string): Promise<PlayerScoreResponseDto[]> => {
  const response = await fetch(`${API_URL}/games/${gameId}/players`);
  if (!response.ok) throw new Error('Failed to retrieve player scores');
  return response.json();
}

export const getPlayerHand = async (gameId: string, playerId: string): Promise<Card[]> => {
  const response = await fetch(`${API_URL}/games/${gameId}/players/${playerId}/cards`);
  if (!response.ok) throw new Error(`Failed to retrieve the hand from player ${playerId}`);
  return response.json()
}