import React from 'react';
import './App.css';
import { GameProvider, useGame } from './context/GameContext';
import { GameLobby } from './components/GameLobby/GameLobby';
import { ActiveGameDashboard } from './components/ActiveGame/ActiveGameDashboard';


function AppHeader() {
  const { message } = useGame();
  return (
    <header className="App-header">
      <h1>Card Game Client</h1>
      <p className="message">
        <strong>Status:</strong> {message}
      </p>
    </header>
  );
}

function AppLayout() {
  const { gameId } = useGame();
  
  return (
    <div className="App">
      <AppHeader />
      
      <GameLobby />

      {gameId && <ActiveGameDashboard />}
    </div>
  );
}

function App() {

  return (
    <GameProvider>
      <AppLayout />
    </GameProvider>
  );  
}



export default App;
