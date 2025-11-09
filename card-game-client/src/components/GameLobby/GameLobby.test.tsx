import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameLobby } from './GameLobby';
import { useGame } from '../../context/GameContext';
import { GameSummaryDto } from '../../types/api';

jest.mock('../../context/GameContext');

const mockedUseGame = jest.mocked(useGame);

describe('GameLobby Component', () => {

  const mockCreateNewGame = jest.fn();
  const mockDeleteGame = jest.fn();
  const mockSetGameId = jest.fn();
  const mockFetchGameList = jest.fn();

  beforeEach(() => {
    mockCreateNewGame.mockClear();
    mockDeleteGame.mockClear();
    mockSetGameId.mockClear();
    mockFetchGameList.mockClear();
    
    mockedUseGame.mockReturnValue({
      gameList: [],
      gameId: '123',
      message: '',
      fetchGameList: mockFetchGameList,
      createNewGame: mockCreateNewGame,
      deleteGame: mockDeleteGame,
      setGameId: mockSetGameId,
      setMessage: jest.fn(),
    });
    
    window.confirm = jest.fn(() => true);
  });

  test('should render "No games were found" when list is empty', () => {
    render(<GameLobby />);
    expect(screen.getByText(/No games were found/i)).toBeInTheDocument();
  });

  test('should render the list of games from context', () => {
    const mockGames: GameSummaryDto[] = [
      { gameId: 'game-1', playerCount: 2 },
      { gameId: 'game-2', playerCount: 0 },
    ];
    mockedUseGame.mockReturnValueOnce({
    ...mockedUseGame(),
      gameList: mockGames,
    });

    render(<GameLobby />);

    expect(screen.getByText(/ID: game-1 \(2 players\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: game-2 \(0 players\)/i)).toBeInTheDocument();
  });

  test('should call createNewGame when "Create" button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameLobby />);
    
    await user.click(screen.getByRole('button', { name: /Create a new game/i }));

    expect(mockCreateNewGame).toHaveBeenCalledTimes(1);
  });

  test('should call setGameId when "Load Game" is clicked', async () => {
    const user = userEvent.setup();
    const mockGames: GameSummaryDto[] = [{ gameId: 'game-to-load', playerCount: 1 }];
    mockedUseGame.mockReturnValueOnce({
    ...mockedUseGame(),
      gameList: mockGames,
    });
    
    render(<GameLobby />);

    const loadButton = screen.getByRole('button', { name: /Load game/i });
    await user.click(loadButton);

    expect(mockSetGameId).toHaveBeenCalledWith('game-to-load');
  });

  test('should call deleteGame when "Delete" is clicked', async () => {
    const user = userEvent.setup();
    const mockGames: GameSummaryDto[] = [{ gameId: 'game-to-delete', playerCount: 1 }];
    mockedUseGame.mockReturnValueOnce({
    ...mockedUseGame(),
      gameList: mockGames,
    });
    
    render(<GameLobby />);
    
    const deleteButton = screen.getByRole('button', { name: /Close game/i });
    await user.click(deleteButton);

    expect(mockDeleteGame).toHaveBeenCalledWith('game-to-delete');
  });
});