import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameState } from './GameState';
import { useActiveGame } from '../../hooks/useActiveGame';
import { DeckInfo, PlayerScore, Player } from '../../types/api';
import { standardDeckInfo } from '../../assets/standardDeck';
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

describe('GameState Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test('should render deck info and player scores correctly', () => {
    const player1: Player = {id: "1", name: "Player 1", hand: []}
    const player2: Player = {id: "2", name: "Player 2", hand: []}
    const player3: Player = {id: "3", name: "Player 3", hand: []}
    const mockPlayers: Player[] = [player1, player2, player3];
    const mockDeck: DeckInfo = standardDeckInfo;
    const mockScores: PlayerScore[] = [ 
      { playerId: '1', playerName: "Player 1", totalValue: 20 }
    ];
    
    render(<GameState 
      {...mockHookProps} 
      deckInfo={mockDeck} 
      playerScores={mockScores}
      players={mockPlayers}
    />);

    expect(screen.getByTestId("deck-total-cards")).toHaveTextContent(/Cards total:\s*52/);
    expect(screen.getByText(/HEARTS: 13/i)).toBeInTheDocument();
    expect(screen.getByText(/SPADES: 13/i)).toBeInTheDocument();
    
    expect(screen.getByTestId("player-score")).toHaveTextContent(/Player 1: 20 points/);
  });

  test('should call removePlayer and fetchPlayerScores', async () => {
    const user = userEvent.setup();
    const mockScores: PlayerScore[] = [ 
      { playerId: '1', playerName: "Player 1", totalValue: 20 },
      { playerId: '2', playerName: "Player 2", totalValue: 23 }, 
      { playerId: '3', playerName: "Player 3", totalValue: 17 } 
    ];
    
    render(<GameState 
      {...mockHookProps} 
      playerScores={mockScores}
    />);

    const removeButton = screen.getAllByRole('button', { name: /Remove player/i })[0];
    await user.click(removeButton);

    expect(mockHookProps.removePlayer).toHaveBeenCalledWith('1');
  });
});