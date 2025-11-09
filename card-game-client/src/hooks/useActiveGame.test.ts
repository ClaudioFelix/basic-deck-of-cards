import { renderHook, act, waitFor } from '@testing-library/react';
import { useActiveGame } from './useActiveGame';
import * as gameApi from '../services/gameApi';
import { GameProvider, useGame } from '../context/GameContext';
import { DeckInfo, PlayerScore, Player, PlayerScoreResponseDto } from '../types/api';
import { standardDeckInfo } from '../assets/standardDeck';
import { emptyDeckInfo } from '../assets/emptyDeck';

jest.mock('../services/gameApi');

jest.mock('../context/GameContext');

const mockedGameApi = jest.mocked(gameApi);
const mockedUseGame = jest.mocked(useGame);

describe('useActiveGame Hook', () => {

  beforeEach(() => {
    mockedGameApi.getDeckInfo.mockClear();
    mockedGameApi.getPlayerScores.mockClear();
    mockedGameApi.addPlayer.mockClear();
    mockedGameApi.removePlayer.mockClear();

    mockedUseGame.mockReturnValue({
      message: '',
      setMessage: jest.fn(),
      gameList: [],
      gameId: 'test-game',
      fetchGameList: jest.fn(),
      createNewGame: jest.fn(),
      deleteGame: jest.fn(),
      setGameId: jest.fn(),
    });
  });

  test('it should provide initial data when the gameId is provided', async () => {
    
    mockedGameApi.getDeckInfo.mockResolvedValue(emptyDeckInfo);
    mockedGameApi.getPlayerScores.mockResolvedValue([]);

    const { result } = renderHook(() => useActiveGame('test-game'));

    await waitFor(() => {
      expect(mockedGameApi.getDeckInfo).toHaveBeenCalledWith('test-game');
      expect(mockedGameApi.getPlayerScores).toHaveBeenCalledWith('test-game');
    });

    expect(result.current.deckInfo).toEqual(emptyDeckInfo);
    expect(result.current.playerScores).toEqual([]);
    expect(result.current.players.length).toBe(0);
  });

  test('addPlayer should call the API and update the local players state', async () => {

    mockedGameApi.getDeckInfo.mockResolvedValue(standardDeckInfo);
    mockedGameApi.getPlayerScores.mockResolvedValue([]);
    mockedGameApi.addPlayer.mockResolvedValue({ id: 'new-player', name: "Player" });

    const { result } = renderHook(() => useActiveGame('test-game'));
    await waitFor(() => expect(result.current.players).toEqual([]));
    act(() => {
      result.current.setNewPlayerName('Player');
    });

    await act(async () => {
      await result.current.addPlayer();
    });

    expect(mockedGameApi.addPlayer).toHaveBeenCalledWith('test-game', 'Player');
    
    expect(result.current.players.length).toBe(1);
    expect(result.current.players[0].name).toBe('Player');
    
    expect(result.current.newPlayerName).toBe('');
  });
  
  test('removePlayer should call the API and update the scores', async () => {
    
    const mockScores: PlayerScore[] = [{ playerId: 'p1', playerName: "Player", totalValue: 10 }];
    mockedGameApi.getDeckInfo.mockResolvedValue({} as DeckInfo);
    mockedGameApi.removePlayer.mockResolvedValue();
    
    mockedGameApi.getPlayerScores.mockResolvedValueOnce(mockScores)
                                   .mockResolvedValueOnce([]);

    window.confirm = jest.fn(() => true);

    const { result } = renderHook(() => useActiveGame('test-game'));

    await waitFor(() => expect(result.current.playerScores.length).toBe(1));

    await act(async () => {
      await result.current.removePlayer('p1');
    });

    expect(mockedGameApi.removePlayer).toHaveBeenCalledWith('test-game', 'p1');
    expect(result.current.playerScores.length).toBe(0);
  });
});