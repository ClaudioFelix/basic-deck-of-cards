/*
 * GameService
 *
 * Game CreateGame(): Creates and returns a new Game
 * void DeleteGame(UUID gameId): Deletes a game
 * Game findGameById(UUID gameId): Returns a game
 * List<GameSummaryResponse> getAllGames(): Returns all games
 * void addDeckToGame(UUID gameId): Creates a standard deck
 *   and adds it to a game shoe
 * void shuffle(UUID gameId):
 *   Convert deque to list for efficient shuffling
 *   Swaps each card sequentially with a randomly selected
 *    one from the remaining positions (Fisher-Yates) O(n)
 * UUID addPlayer(UUID gameId, String playerName): Creates
 *   a player and adds it to the game
 * void removePlayer(UUID gameId, UUID playerId): Removes a
 *   player from the game. This does not return cards to the
 *   deck, as per specification.
 * List<Card> dealCards(UUID gameId, UUID playerId, int amount):
 *   Polls cards from the top of the deck and add them to the
 *    player's hand up to the amount (if available).
 * List<Card> getPlayerHand(UUID gameId, UUID playerId):
 *   Returns the hand of a player
 * List<PlayerScoreResponse> getPlayersWithScores(UUID gameId):
 *   Returns the sorted list of players with their game scores.
 *   The DTO implements Comparable for descending order.
 * DeckInfoResponse getDeckInfo(UUID gameId): Returns the deck
 *  information with the undealt suit counts and the undealt cards.
 */

package com.example.card_game_api.game;

import com.example.card_game_api.card.Card;
import com.example.card_game_api.card.Rank;
import com.example.card_game_api.card.Suit;
import com.example.card_game_api.game.dto.response.AddPlayerResponse;
import com.example.card_game_api.game.dto.response.DeckInfoResponse;
import com.example.card_game_api.game.dto.response.GameSummaryResponse;
import com.example.card_game_api.game.dto.response.PlayerScoreResponse;
import com.example.card_game_api.player.Player;
import com.example.card_game_api.player.PlayerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class GameService {

  private final GameRepository gameRepository;
  private final PlayerRepository playerRepository;

  public GameService(GameRepository gameRepository, PlayerRepository playerRepository) {
    this.gameRepository = gameRepository;
    this.playerRepository = playerRepository;
  }

  public Game createGame() {
    Game newGame = new Game();
    return gameRepository.save(newGame);
  }

  @Transactional
  public void deleteGame(UUID gameId) {
    gameRepository.deleteById(gameId);
  }

  public Game findGameById(UUID gameId) {
    return gameRepository.findById(gameId)
               .orElseThrow(() -> new NoSuchElementException("Game not found"));
  }

  public List<GameSummaryResponse> getAllGames() {
    return gameRepository.findAll().stream()
               .map(game -> new GameSummaryResponse(
                   game.getId(),
                   game.getPlayers().size()
               ))
               .collect(Collectors.toList());
  }

  @Transactional
  public void addDeckToGame(UUID gameId) {
    Game game = findGameById(gameId);
    List<Card> standardDeck = new ArrayList<>();
    for (Suit suit : Suit.values()) {
      for (Rank rank : Rank.values()) {
        standardDeck.add(new Card(suit, rank));
      }
    }
    game.getGameDeck().addAll(standardDeck);
  }

  @Transactional
  public void shuffle(UUID gameId) {
    Game game = findGameById(gameId);
    List<Card> cards = new ArrayList<>(game.getGameDeck());
    game.getGameDeck().clear();

    Random rand = ThreadLocalRandom.current();
    for (int i = cards.size() - 1; i > 0; i--) {
      int index = rand.nextInt(i + 1);
      Card a = cards.get(index);
      cards.set(index, cards.get(i));
      cards.set(i, a);
    }
    game.getGameDeck().addAll(cards);
  }

  @Transactional
  public AddPlayerResponse addPlayer(UUID gameId, String playerName) {
    Game game = findGameById(gameId);
    Player player = new Player(playerName, game);
    game.getPlayers().add(player);
    gameRepository.save(game);
    return new AddPlayerResponse(player.getId(), player.getName());
  }

  @Transactional
  public void removePlayer(UUID gameId, UUID playerId) {
    Game game = findGameById(gameId);
    Player playerToRemove = game.getPlayers().stream()
                                .filter(p -> p.getId().equals(playerId))
                                .findFirst()
                                .orElseThrow(() -> new NoSuchElementException("Player not found in game"));
    game.getPlayers().remove(playerToRemove);
    gameRepository.save(game);
  }

  @Transactional
  public List<Card> dealCards(UUID gameId, UUID playerId, int amount) {
    Game game = findGameById(gameId);
    Player player = game.getPlayers().stream()
                                .filter(p -> p.getId().equals(playerId))
                                .findFirst()
                                .orElseThrow(() -> new NoSuchElementException("Player not found in game"));

    List<Card> deck = game.getGameDeck();
    if (deck.isEmpty()) {
      return Collections.emptyList();
    }

    List<Card> dealtCards = new ArrayList<>();
    for (int i = 0; i < amount &&!deck.isEmpty(); i++) {
      Card card = deck.remove(0);
      dealtCards.add(card);
    }

    player.getHand().addAll(dealtCards);
    gameRepository.save(game);
    playerRepository.save(player);
    return dealtCards;
  }

  public List<Card> getPlayerHand(UUID gameId, UUID playerId) {
    Game game = findGameById(gameId);
    Player player = game.getPlayers().stream()
                                .filter(p -> p.getId().equals(playerId))
                                .findFirst()
                                .orElseThrow(() -> new NoSuchElementException("Player not found in game"));

    return player.getHand();
  }

  public List<PlayerScoreResponse> getPlayersWithScores(UUID gameId) {
    Game game = findGameById(gameId);

    return game.getPlayers().stream()
               .map(player -> {
                 int totalValue = player.getHand().stream()
                                      .mapToInt(card -> card.getRank().getValue())
                                      .sum();
                 return new PlayerScoreResponse(player.getId(), player.getName(), totalValue);
               })
               .sorted()
               .collect(Collectors.toList());
  }

  public DeckInfoResponse getDeckInfo(UUID gameId) {
    Game game = findGameById(gameId);

    Map<String, Long> suitCounts = game.getGameDeck().stream()
                                       .collect(Collectors.groupingBy(
                                           card -> card.getSuit().name(),
                                           Collectors.counting()
                                       ));
    for (Suit suit : Suit.values()) {
      suitCounts.putIfAbsent(suit.name(), 0L);
    }

    List<Card> sortedCards = new ArrayList<>(game.getGameDeck());
    Comparator<Card> cardComparator = Comparator
                                          .comparing(Card::getSuit)
                                          .thenComparing(
                                              Card::getRank,
                                              Comparator.comparingInt(Rank::getValue).reversed()
                                          );
    sortedCards.sort(cardComparator);

    return new DeckInfoResponse(game.getGameDeck().size(), suitCounts, sortedCards);
  }
}