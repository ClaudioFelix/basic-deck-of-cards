import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as gameApi from './services/gameApi';
import { GameSummaryDto, DeckInfo, PlayerScore, GameDto, Player, Card, AddPlayerResponseDto } from './types/api';
import { standardDeckInfo, standardSortedCards } from './assets/standardDeck';

jest.mock('./services/gameApi');

const mockedGameApi = jest.mocked(gameApi);

const cardListFactory: Card[] = [
  {suit: 'CLUBS', rank: 'FIVE'},
  {suit: 'SPADES', rank: 'KING'},
  {suit: 'SPADES', rank: 'ACE'}
]

const mockGames: GameSummaryDto[] = [
  { gameId: 'game-1', playerCount: 3 },
];
const mockDeck: DeckInfo = standardDeckInfo
const mockScores: PlayerScore[] = [ 
  { playerId: '1', playerName: "Player 1", totalValue: 20 },
  { playerId: '2', playerName: "Player 2", totalValue: 23 }, 
  { playerId: '3', playerName: "Player 3", totalValue: 17 } 
];
const mockGame: GameDto = { id: 'game-1', gameDeck: standardSortedCards, players: {} };
const mockPlayerResponse: AddPlayerResponseDto = { id: '4', name: "New Player" };
const mockDealtCards: Card[] = cardListFactory;

describe('App Integration Test', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedGameApi.getGameList.mockResolvedValue(mockGames);
    mockedGameApi.createGame.mockResolvedValue(mockGame);
    mockedGameApi.deleteGame.mockResolvedValue();
    mockedGameApi.getDeckInfo.mockResolvedValue(mockDeck);
    mockedGameApi.getPlayerScores.mockResolvedValue(mockScores);
    mockedGameApi.addPlayer.mockResolvedValue(mockPlayerResponse);
    mockedGameApi.dealCards.mockResolvedValue(mockDealtCards);
    mockedGameApi.getPlayerHand.mockResolvedValue(mockDealtCards);
    
    window.confirm = jest.fn(() => true);
  });

  test('full user flow: load game, add player, and deal cards', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/ID: game-1/i)).toBeInTheDocument();
    expect(screen.getByText(/3 players/i)).toBeInTheDocument();

    const loadButton = screen.getByRole('button', { name: /Load game/i });
    await user.click(loadButton);

    expect(screen.getByTestId("current-game-id")).toHaveTextContent(/Current Game ID: game-1/);

    const totalCardsElement = await screen.findByTestId("deck-total-cards");
    expect(totalCardsElement).toHaveTextContent(/Cards total:\s*52/);
    expect(screen.getByText(/HEARTS: 13/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Player name/i);
    const addButton = screen.getByRole('button', { name: 'Add player' });

    expect(addButton).toBeDisabled();

    await user.type(nameInput, 'New Player');

    expect(addButton).toBeEnabled();

    await user.click(addButton);
    expect(mockedGameApi.addPlayer).toHaveBeenCalledWith('game-1', 'New Player');
    expect(screen.getByTestId("message")).toHaveTextContent(/Player New Player added./);
    expect(screen.getAllByTestId("player-list-item").slice(-1)[0]).toHaveTextContent(/Player: New Player/);
    
    const playerSelect = screen.getByRole('combobox');
    const dealButton = screen.getByRole('button', { name: /Deal/i });
    const amountInput = screen.getByTestId('deal-amount');

    await user.type(amountInput, '5');
    await user.selectOptions(playerSelect, 'Player 1');
    await user.click(dealButton);

    expect(await screen.findByText(/FIVE of CLUBS/i)).toBeInTheDocument();
    
    expect(mockedGameApi.getGameList).toHaveBeenCalled();
    expect(mockedGameApi.getDeckInfo).toHaveBeenCalledWith('game-1');
    expect(mockedGameApi.getPlayerScores).toHaveBeenCalledWith('game-1');
    expect(mockedGameApi.dealCards).toHaveBeenCalledWith('game-1', '1', 5);
    expect(mockedGameApi.getPlayerHand).toHaveBeenCalledWith('game-1', '1');
  });
});