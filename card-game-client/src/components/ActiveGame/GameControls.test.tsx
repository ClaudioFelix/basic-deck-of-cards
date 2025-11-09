import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameControls } from './GameControls';
import { useActiveGame } from '../../hooks/useActiveGame';
import { Player } from '../../types/api';

const createMockHookProps = (): ReturnType<typeof useActiveGame> => ({
  players: [],
  deckInfo: null,
  playerScores: [],
  selectedPlayer: null,
  dealAmount: 0,
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
});

describe('GameControls Component', () => {

  let mockHookProps: ReturnType<typeof useActiveGame>;

  beforeEach(() => {
    mockHookProps = createMockHookProps();
    jest.clearAllMocks();
  });

  test('should call addDeck when button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameControls {...mockHookProps} />);

    await user.click(screen.getByRole('button', { name: /Add a new deck/i }));

    expect(mockHookProps.addDeck).toHaveBeenCalledTimes(1);
  });

  test('should call shuffle when button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameControls {...mockHookProps} />);

    await user.click(screen.getByRole('button', { name: /Shuffle/i }));

    expect(mockHookProps.shuffle).toHaveBeenCalledTimes(1);
  });

  test('should call setNewPlayerName when user types in the name input', async () => {
    const user = userEvent.setup();
    render(<GameControls {...mockHookProps} />);
    
    const input = screen.getByPlaceholderText(/Player name/i);

    await user.type(input, 'Test');

    expect(mockHookProps.setNewPlayerName).toHaveBeenCalledWith('T');
    expect(mockHookProps.setNewPlayerName).toHaveBeenCalledWith('e');
    expect(mockHookProps.setNewPlayerName).toHaveBeenCalledWith('s');
    expect(mockHookProps.setNewPlayerName).toHaveBeenCalledWith('t');
  });

  test('should disable "Add" button if name is empty', () => {
    render(<GameControls {...mockHookProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add player/i });
    expect(addButton).toBeDisabled();
  });

  test('should enable "Add" button when newPlayerName prop is not empty', () => {
    
    const propsWithAName = {
    ...mockHookProps,
      newPlayerName: 'Test Player',
    };
    render(<GameControls {...propsWithAName} />);

    const addButton = screen.getByRole('button', { name: /Add player/i });
    expect(addButton).toBeEnabled();
  });

  test('should call addPlayer when the button is clicked (with name)', async () => {
    const user = userEvent.setup();
    const propsWithAName = {
    ...mockHookProps,
      newPlayerName: 'Test Player',
    };
    render(<GameControls {...propsWithAName} />);
    const addButton = screen.getByRole('button', { name: /Add player/i });
    await user.click(addButton);

    expect(mockHookProps.addPlayer).toHaveBeenCalledTimes(1);
  });
  
  test('should call dealCards with selected player and amount', async () => {
    const user = userEvent.setup();
    const mockPlayer: Player = { id: 'p1', name: 'Player 1', hand: []};
    
    render(<GameControls 
      {...mockHookProps} 
      players={[mockPlayer]}
    />);

    const select = screen.getByRole('combobox');
    const amountInput = screen.getByTestId('deal-amount');
    const dealButton = screen.getByRole('button', { name: /Deal/i });

    await user.selectOptions(select, 'p1');
    await user.type(amountInput, '5');
    await user.click(dealButton);

    expect(mockHookProps.setSelectedPlayer).toHaveBeenCalledWith(mockPlayer);
    expect(mockHookProps.setDealAmount).toHaveBeenCalledWith(5);
    expect(mockHookProps.dealCards).toHaveBeenCalledTimes(1);
  });
});