import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerList } from './PlayerList';
import { useActiveGame } from '../../hooks/useActiveGame';
import { Player, Card } from '../../types/api';
import { emptyDeckInfo } from '../../assets/emptyDeck';

const mockHookProps: ReturnType<typeof useActiveGame> = {
  players: [],
  deckInfo: emptyDeckInfo,
  playerScores: [],
  selectedPlayer: null,
  dealAmount: 1,
  newPlayerName: '',
  setNewPlayerName: jest.fn(),
  setSelectedPlayer: jest.fn(),
  setDealAmount: jest.fn(),
  addDeck: jest.fn(),
  shuffle: jest.fn(),
  addPlayer: jest.fn(),
  removePlayer: jest.fn(),
  dealCards: jest.fn(),
  fetchPlayerHand: jest.fn(),
  fetchPlayerScores: jest.fn(),
};

const cardListFactory: Card[] = [
  {suit: 'CLUBS', rank: 'FIVE'},
  {suit: 'SPADES', rank: 'KING'},
  {suit: 'SPADES', rank: 'ACE'}
]

describe('PlayerList Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render a player with an empty hand', () => {
    const player1: Player = {id: "1", name: "Player 1", hand: []}
    const mockPlayers: Player[] = [player1];
    render(<PlayerList {...mockHookProps} players={mockPlayers} />);

    expect(screen.getByText(/Player: Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Empty hand\)/i)).toBeInTheDocument();
  });

  test('should render a player with cards in hand', () => {
    const player1: Player = {id: "1", name: "Player 1", hand: cardListFactory}
    const player2: Player = {id: "2", name: "Player 2", hand: []}
    const player3: Player = {id: "3", name: "Player 3", hand: []}
    const mockPlayers: Player[] = [player1, player2, player3];
    render(<PlayerList {...mockHookProps} players={mockPlayers} />);

    expect(screen.getByText(/KING of SPADES/i)).toBeInTheDocument();
  });
});