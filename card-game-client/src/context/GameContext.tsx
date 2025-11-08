import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GameDto, GameSummaryDto } from '../types/api';
import * as gameApi from '../services/gameApi';

type GameContextType = {
  gameList: GameSummaryDto[];
  gameId: string | null;
  message: string;
  fetchGameList: () => Promise<void>;
  createNewGame: () => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  setGameId: (id: string | null) => void;
  setMessage: (message: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameProviderProps = {
  children: ReactNode;
};

export function GameProvider({ children }: GameProviderProps) {
  const [gameList, setGameList] = useState<GameSummaryDto[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Welcome! Create a new game to start.');
  
  const fetchGameList = useCallback(async () => {
    try {
      const data: GameSummaryDto[] = await gameApi.getGameList();
      setGameList(data);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  },[]);

  const createNewGame = useCallback(async () => {
    try {
      setMessage('Creating a new game...');
      const data: GameDto = await gameApi.createGame();
      setGameId(data.id);
      setMessage(`Game created: ${data.id}. Add decks and players.`);
      await fetchGameList(); // Atualiza a lista
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  }, [fetchGameList]);

  const deleteGame = useCallback(async (idToDelete: string) => {
    if (!window.confirm(`Are you sure you want to close the game ${idToDelete}?`)) {
      return;
    }
    try {
      await gameApi.deleteGame(idToDelete);
      setMessage(`Game ${idToDelete} closed.`);
      await fetchGameList();
      
      if (gameId === idToDelete) {
        setGameId(null);
      }
    } catch (error) {
      setMessage(`Error closing game: ${(error as Error).message}`);
    }
  }, [gameId, fetchGameList]);
  
   const value = {
     gameList,
     gameId,
     message,
     fetchGameList,
     createNewGame,
     deleteGame,
     setGameId,
     setMessage,
   };

   return (
     <GameContext.Provider value={value}>
       {children}
     </GameContext.Provider>
   );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame should be using within a GameProvider');
  }
  return context;
}