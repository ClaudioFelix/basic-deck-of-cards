import { 
  getGameList, 
  createGame, 
  deleteGame, 
  addPlayer, 
  dealCards, 
  addDeck, 
  shuffle 
} from './gameApi';
import { GameDto, GameSummaryDto, AddPlayerRequestDto, DealRequestDto, Card } from '../types/api';

global.fetch = jest.fn();

const cardListFactory: Card[] = [
  {suit: 'CLUBS', rank: 'FIVE'},
  {suit: 'SPADES', rank: 'KING'},
  {suit: 'SPADES', rank: 'ACE'}
]

const mockedFetch = jest.mocked(global.fetch);

beforeEach(() => {
  mockedFetch.mockClear();
});

const mockOkResponse = (data: any) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
} as Response);

const mockCreatedResponse = (data: any) => ({
  ok: false,
  status: 201,
  json: () => Promise.resolve(data),
} as Response);

test('getGameList should call GET /games', async () => {
  const mockGames: GameSummaryDto[] = [{ gameId: '123', playerCount: 0 }];
  mockedFetch.mockResolvedValue(mockOkResponse(mockGames));

  await getGameList();

  expect(mockedFetch).toHaveBeenCalledWith('http://localhost:8080/games');
});

test('createGame should call POST /games', async () => {
  const mockGame: GameDto = { id: '123', gameDeck: [], players: {} };
  mockedFetch.mockResolvedValue(mockCreatedResponse(mockGame));

  await createGame();

  expect(mockedFetch).toHaveBeenCalledWith(
    'http://localhost:8080/games',
    expect.objectContaining({ method: 'POST' })
  );
});

test('deleteGame should call DELETE /games/{id}', async () => {
  mockedFetch.mockResolvedValue({ ok: false, status: 204 } as Response);
  const gameId = 'game-123';

  await deleteGame(gameId);

  expect(mockedFetch).toHaveBeenCalledWith(
    `http://localhost:8080/games/${gameId}`,
    expect.objectContaining({ method: 'DELETE' })
  );
});

test('addDeck should call POST /games/{id}/add-deck', async () => {
  mockedFetch.mockResolvedValue(mockOkResponse(null));
  const gameId = 'game-123';

  await addDeck(gameId);

  expect(mockedFetch).toHaveBeenCalledWith(
    `http://localhost:8080/games/${gameId}/add-deck`,
    expect.objectContaining({ method: 'POST' })
  );
});

test('shuffle should call POST /games/{id}/shuffle', async () => {
  mockedFetch.mockResolvedValue(mockOkResponse(null));
  const gameId = 'game-123';

  await shuffle(gameId);

  expect(mockedFetch).toHaveBeenCalledWith(
    `http://localhost:8080/games/${gameId}/shuffle`,
    expect.objectContaining({ method: 'POST' })
  );
});

test('addPlayer should call POST with a correct body', async () => {
  const gameId = 'game-123';
  const playerRequest: AddPlayerRequestDto = { name: 'Test Player' };
  const playerResponse = { playerId: 'player-uuid' };
  
  mockedFetch.mockResolvedValue(mockCreatedResponse(playerResponse));

  await addPlayer(gameId, playerRequest.name);

  expect(mockedFetch).toHaveBeenCalledWith(
    `http://localhost:8080/games/${gameId}/players`,
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playerRequest)
    })
  );
});

test('dealCards should call POST a correct body', async () => {
  const gameId = 'game-123';
  const dealRequest: DealRequestDto = { playerId: 'player-uuid', amount: 5 };
  const mockCards: Card[] = cardListFactory;
  
  mockedFetch.mockResolvedValue(mockCreatedResponse(mockCards));

  await dealCards(gameId, dealRequest.playerId, dealRequest.amount);

  expect(mockedFetch).toHaveBeenCalledWith(
    `http://localhost:8080/games/${gameId}/deal-cards`,
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealRequest)
    })
  );
});