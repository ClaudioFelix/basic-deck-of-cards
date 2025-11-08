package com.example.card_game_api.game;

import com.example.card_game_api.card.Card;
import com.example.card_game_api.card.Rank;
import com.example.card_game_api.card.Suit;
import com.example.card_game_api.game.dto.response.DeckInfoResponse;
import com.example.card_game_api.game.dto.response.GameSummaryResponse;
import com.example.card_game_api.game.dto.response.PlayerScoreResponse;
import com.example.card_game_api.player.Player;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

  @Mock
  private GameRepository gameRepository;

  @InjectMocks
  private GameService gameService;

  private Game game;
  private UUID gameId;

  @Test
  void getAllGames_whenNoGamesExist_shouldReturnEmptyList() {
    when(gameRepository.findAll()).thenReturn(Collections.emptyList());
    List<GameSummaryResponse> summaries = gameService.getAllGames();
    assertThat(summaries).isEmpty();
  }

  @Test
  void getAllGames_shouldReturnSummaries() {
    Game game1 = new Game();
    Game game2 = new Game();
    UUID playerId = UUID.randomUUID();
    game2.getPlayers().put(playerId, new Player(playerId, new ArrayList<>(), "name"));

    when(gameRepository.findAll()).thenReturn(List.of(game1, game2));

    List<GameSummaryResponse> summaries = gameService.getAllGames();

    assertThat(summaries).hasSize(2);
    assertThat(summaries)
        .extracting(GameSummaryResponse::getGameId)
        .containsExactlyInAnyOrder(game1.getId(), game2.getId());

    assertThat(summaries)
        .extracting(GameSummaryResponse::getPlayerCount)
        .containsExactlyInAnyOrder(0, 1);
  }

  @Test
  void createGame_shouldReturnNewGame() {
    Game newGame = new Game();
    when(gameRepository.save(any(Game.class))).thenReturn(newGame);

    Game createdGame = gameService.createGame();

    assertThat(createdGame).isNotNull();
    assertThat(createdGame.getId()).isEqualTo(newGame.getId());
    verify(gameRepository).save(any(Game.class));
  }

  @Test
  void deleteGame_shouldCallRepositoryDelete() {
    doNothing().when(gameRepository).deleteById(gameId);
    gameService.deleteGame(gameId);
    verify(gameRepository).deleteById(gameId);
  }

  @Test
  void deleteGame_whenGameNotFound_shouldThrowException() {
    UUID nonExistentId = UUID.randomUUID();
    doThrow(new NoSuchElementException("Game not found")).when(gameRepository).deleteById(nonExistentId);

    assertThatThrownBy(() -> gameService.deleteGame(nonExistentId))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessage("Game not found");
  }

  @Test
  void addDeckToGame_shouldAdd52Cards() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));
    gameService.addDeckToGame(gameId);
    assertThat(game.getGameDeck()).hasSize(52);
  }

  @Test
  void shuffle_shouldRandomizeCardOrder() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    gameService.addDeckToGame(gameId);
    List<Card> originalOrder = new ArrayList<>(game.getGameDeck());

    gameService.shuffle(gameId);

    List<Card> shuffledOrder = new ArrayList<>(game.getGameDeck());
    assertThat(shuffledOrder).hasSize(52);
    assertThat(shuffledOrder).isNotEqualTo(originalOrder);
    assertThat(shuffledOrder).containsExactlyInAnyOrderElementsOf(originalOrder);
  }

  @Test
  void shuffle_whenGameNotFound_shouldThrowException() {
    UUID nonExistentId = UUID.randomUUID();
    when(gameRepository.findById(nonExistentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> gameService.shuffle(nonExistentId))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessage("Game not found");
  }

  @Test
  void addPlayer_shouldAddNewPlayerWithEmptyHand() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");

    assertThat(playerId).isNotNull();
    assertThat(game.getPlayers()).containsKey(playerId);
    assertThat(game.getPlayers().get(playerId).getHand()).isEmpty();
  }

  @Test
  void addPlayer_whenGameNotFound_shouldThrowException() {
    UUID nonExistentId = UUID.randomUUID();
    when(gameRepository.findById(nonExistentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> gameService.addPlayer(nonExistentId, "name"))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessage("Game not found");
  }

  @Test
  void removePlayer_shouldRemovePlayerFromGame() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");
    assertThat(game.getPlayers()).containsKey(playerId);

    gameService.removePlayer(gameId, playerId);

    assertThat(game.getPlayers()).doesNotContainKey(playerId);
  }

  @Test
  void removePlayer_whenGameNotFound_shouldThrowException() {
    UUID nonExistentId = UUID.randomUUID();
    when(gameRepository.findById(nonExistentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> gameService.removePlayer(nonExistentId, UUID.randomUUID()))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessage("Game not found");
  }

  @Test
  void removePlayer_shouldNotAffectShoeState() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    gameService.addDeckToGame(gameId);
    UUID playerId = gameService.addPlayer(gameId, "name");
    gameService.dealCards(gameId, playerId, 5);

    int deckSizeBefore = game.getGameDeck().size();
    List<Card> deckContentsBefore = new ArrayList<>(game.getGameDeck());

    gameService.removePlayer(gameId, playerId);

    assertThat(game.getGameDeck().size()).isEqualTo(deckSizeBefore);
    assertThat(new ArrayList<>(game.getGameDeck())).isEqualTo(deckContentsBefore);
  }

  @Test
  void dealCards_shouldMoveCardsFromDeckToPlayer() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");
    gameService.addDeckToGame(gameId);
    List<Card> deckBeforeDeal = new ArrayList<>(game.getGameDeck());

    List<Card> dealtCards = gameService.dealCards(gameId, playerId, 5);
    List<Card> deckAfterDeal = new ArrayList<>(game.getGameDeck());

    assertThat(dealtCards).hasSize(5);
    assertThat(game.getGameDeck()).hasSize(47);
    assertThat(game.getPlayers().get(playerId).getHand()).hasSize(5);
    assertThat(game.getPlayers().get(playerId).getHand()).isEqualTo(dealtCards);

    deckBeforeDeal.removeAll(dealtCards);
    assertThat(deckAfterDeal).containsExactlyInAnyOrderElementsOf(deckBeforeDeal);
  }

  @Test
  void dealCards_shouldReturnAll52CardsAndThenEmpty() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");
    gameService.addDeckToGame(gameId);
    gameService.shuffle(gameId);

    List<Card> allDealtCards = new ArrayList<>();

    for (int i = 0; i < 52; i++) {
      List<Card> dealtCard = gameService.dealCards(gameId, playerId, 1);
      allDealtCards.addAll(dealtCard);
    }

    List<Card> emptyDeal = gameService.dealCards(gameId, playerId, 1);

    assertThat(allDealtCards).hasSize(52);
    assertThat(game.getPlayers().get(playerId).getHand()).hasSize(52);
    assertThat(allDealtCards.stream().distinct().count()).isEqualTo(52);
    assertThat(game.getGameDeck()).isEmpty();
    assertThat(emptyDeal).isEmpty();
  }

  @Test
  void dealCards_whenDeckIsEmpty_shouldDealNoCards() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");

    List<Card> dealtCards = gameService.dealCards(gameId, playerId, 1);

    assertThat(dealtCards).isEmpty();
    assertThat(game.getGameDeck()).isEmpty();
    assertThat(game.getPlayers().get(playerId).getHand()).isEmpty();
  }

  @Test
  void dealCards_whenPlayerNotInGame_shouldThrowException() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID invalidPlayerId = UUID.randomUUID();

    assertThatThrownBy(() -> gameService.dealCards(gameId, invalidPlayerId, 1))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Player not in game");
  }

  @Test
  void getPlayerHand_shouldReturnPlayerCards() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID playerId = gameService.addPlayer(gameId, "name");
    Card card1 = new Card(Suit.HEARTS, Rank.ACE);
    game.getPlayers().get(playerId).getHand().add(card1);

    List<Card> hand = gameService.getPlayerHand(gameId, playerId);

    assertThat(hand).containsExactly(card1);
  }

  @Test
  void getPlayersWithScores_shouldReturnSortedScores() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    UUID player1Id = gameService.addPlayer(gameId, "name1");
    game.getPlayers().get(player1Id).getHand().add(new Card(Suit.HEARTS, Rank.TEN));
    game.getPlayers().get(player1Id).getHand().add(new Card(Suit.CLUBS, Rank.TWO));

    UUID player2Id = gameService.addPlayer(gameId, "name2");
    game.getPlayers().get(player2Id).getHand().add(new Card(Suit.SPADES, Rank.KING));

    UUID player3Id = gameService.addPlayer(gameId, "name3");
    game.getPlayers().get(player3Id).getHand().add(new Card(Suit.DIAMONDS, Rank.ACE));
    game.getPlayers().get(player3Id).getHand().add(new Card(Suit.HEARTS, Rank.FIVE));

    List<PlayerScoreResponse> scores = gameService.getPlayersWithScores(gameId);

    assertThat(scores).hasSize(3);
    assertThat(scores.get(0).getPlayerId()).isEqualTo(player2Id);
    assertThat(scores.get(0).getTotalValue()).isEqualTo(13);

    assertThat(scores.get(1).getPlayerId()).isEqualTo(player1Id);
    assertThat(scores.get(1).getTotalValue()).isEqualTo(12);

    assertThat(scores.get(2).getPlayerId()).isEqualTo(player3Id);
    assertThat(scores.get(2).getTotalValue()).isEqualTo(6);
  }

  @Test
  void getDeckInfo_shouldReturnSortedListAndCounts() {
    game = new Game();
    gameId = game.getId();
    when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

    Card hAce = new Card(Suit.HEARTS, Rank.ACE);
    Card hKing = new Card(Suit.HEARTS, Rank.KING);
    Card sJack = new Card(Suit.SPADES, Rank.JACK);
    Card cTwo = new Card(Suit.CLUBS, Rank.TWO);

    game.getGameDeck().addAll(Arrays.asList(cTwo, sJack, hKing, hAce));

    DeckInfoResponse response = gameService.getDeckInfo(gameId);

    assertThat(response.getTotalCards()).isEqualTo(4);
    assertThat(response.getSuitCounts()).hasSize(4);
    assertThat(response.getSuitCounts().get("HEARTS")).isEqualTo(2);
    assertThat(response.getSuitCounts().get("SPADES")).isEqualTo(1);
    assertThat(response.getSuitCounts().get("CLUBS")).isEqualTo(1);
    assertThat(response.getSuitCounts().get("DIAMONDS")).isEqualTo(0);

    assertThat(response.getSortedCards()).containsExactly(
        hKing,
        hAce,
        sJack,
        cTwo
    );
  }
}
