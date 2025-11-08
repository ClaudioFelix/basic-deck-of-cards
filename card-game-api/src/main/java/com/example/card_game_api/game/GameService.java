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
import com.example.card_game_api.game.dto.response.DeckInfoResponse;
import com.example.card_game_api.game.dto.response.GameSummaryResponse;
import com.example.card_game_api.game.dto.response.PlayerScoreResponse;
import com.example.card_game_api.player.Player;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class GameService {

  private final GameRepository gameRepository;

  public GameService(GameRepository gameRepository) {
    this.gameRepository = gameRepository;
  }

  public Game createGame() {
    Game newGame = new Game();
    return gameRepository.save(newGame);
  }

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

  public UUID addPlayer(UUID gameId, String playerName) {
    Game game = findGameById(gameId);
    UUID playerId = UUID.randomUUID();
    Player player = new Player(playerId, new ArrayList<>(), playerName);
    game.getPlayers().put(playerId, player);
    return playerId;
  }

  public void removePlayer(UUID gameId, UUID playerId) {
    Game game = findGameById(gameId);
    if (!game.getPlayers().containsKey(playerId)) {
      throw new NoSuchElementException("Player not found in game");
    }
    game.getPlayers().remove(playerId);
  }

  public List<Card> dealCards(UUID gameId, UUID playerId, int amount) {
    Game game = findGameById(gameId);
    if (!game.getPlayers().containsKey(playerId)) {
      throw new IllegalArgumentException("Player not in game");
    }

    List<Card> dealtCards = new ArrayList<>();
    for (int i = 0; i < amount; i++) {
      Card card = game.getGameDeck().poll();
      if (card != null) {
        dealtCards.add(card);
      } else {
        break;
      }
    }

    game.getPlayers().get(playerId).receiveCards(dealtCards);
    return dealtCards;
  }

  public List<Card> getPlayerHand(UUID gameId, UUID playerId) {
    Game game = findGameById(gameId);
    if (!game.getPlayers().containsKey(playerId)) {
      throw new NoSuchElementException("Player not in game");
    }
    return game.getPlayers().get(playerId).getHand();
  }

  public List<PlayerScoreResponse> getPlayersWithScores(UUID gameId) {
    Game game = findGameById(gameId);

    return game.getPlayers().entrySet().stream()
               .map(entry -> {
                 UUID playerId = entry.getKey();
                 String playerName = entry.getValue().getName();
                 List<Card> hand = entry.getValue().getHand();
                 int totalValue = hand.stream()
                                      .mapToInt(card -> card.getRank().getValue())
                                      .sum();
                 return new PlayerScoreResponse(playerId, playerName, totalValue);
               }).sorted().collect(Collectors.toList());
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

    List<Card> remainingCards = new ArrayList<>(game.getGameDeck());
    Comparator<Card> cardComparator = Comparator
                                          .comparing(Card::getSuit) // Usa a ordem do enum
                                          .thenComparing(
                                              Card::getRank,
                                              Comparator.comparingInt(Rank::getValue).reversed() // King -> Ace
                                          );
    remainingCards.sort(cardComparator);

    return new DeckInfoResponse(game.getGameDeck().size(), suitCounts, remainingCards);
  }

}