export type Card = {
  suit: 'HEARTS' | 'SPADES' | 'CLUBS' | 'DIAMONDS';
  rank: 'ACE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'EIGHT' | 'NINE' | 'TEN' | 'JACK' | 'QUEEN' | 'KING';
};

export type Player = {
  id: string;
  name: string;
  hand: Card[];
};

export type PlayerScore = {
  playerId: string;
  playerName: string;
  totalValue: number;
};

export type PlayerScoreResponseDto = {
  playerId: string;
  playerName: string;
  totalValue: number;
};

export type DeckInfo = {
  totalCards: number;
  suitCounts: { [key: string]: number };
  sortedCards: Card[];
};

export type AddPlayerResponseDto = {
  id: string;
  name: string;
};

export type AddPlayerRequestDto = {
  name: string;
};

export type DealRequestDto = {
  playerId: string;
  amount: number;
};

export type GameDto = {
  id: string;
  gameDeck: Card[];
  players: Record<string, Card>;
};

export type GameSummaryDto = {
  gameId: string;
  playerCount: number;
};