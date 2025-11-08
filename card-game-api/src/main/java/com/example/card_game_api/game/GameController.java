package com.example.card_game_api.game;

import com.example.card_game_api.card.Card;
import com.example.card_game_api.game.dto.response.*;
import com.example.card_game_api.game.dto.request.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/games")
public class GameController {

  private final GameService gameService;

  public GameController(GameService gameService) {
    this.gameService = gameService;
  }

  @PostMapping
  public ResponseEntity<Game> createGame() {
    Game newGame = gameService.createGame();
    URI location = ServletUriComponentsBuilder
                       .fromCurrentRequest()
                       .path("/{id}")
                       .buildAndExpand(newGame.getId())
                       .toUri();
    return ResponseEntity.created(location).body(newGame);
  }

  @GetMapping
  public List<GameSummaryResponse> getAllGames() {
    return gameService.getAllGames();
  }

  @GetMapping("/{gameId}")
  public Game getGame(@PathVariable UUID gameId) {
    return gameService.findGameById(gameId);
  }

  @DeleteMapping("/{gameId}")
  public ResponseEntity<Void> deleteGame(@PathVariable UUID gameId) {
    gameService.deleteGame(gameId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{gameId}/add-deck")
  public ResponseEntity<Void> addDeckToGame(@PathVariable UUID gameId) {
    gameService.addDeckToGame(gameId);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{gameId}/players")
  public ResponseEntity<AddPlayerResponse> addPlayer(@PathVariable UUID gameId, @RequestBody String playerName) {
    UUID playerId = gameService.addPlayer(gameId, playerName);
    URI location = ServletUriComponentsBuilder
                       .fromCurrentRequest()
                       .path("/{id}")
                       .buildAndExpand(playerId)
                       .toUri();
    return ResponseEntity.created(location).body(new AddPlayerResponse(playerId, playerName));
  }

  @DeleteMapping("/{gameId}/players/{playerId}")
  public ResponseEntity<Void> removePlayer(@PathVariable UUID gameId, @PathVariable UUID playerId) {
    gameService.removePlayer(gameId, playerId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{gameId}/deal-cards")
  public ResponseEntity<List<Card>> dealCards(@PathVariable UUID gameId, @RequestBody DealRequest dealRequest) {
    List<Card> dealtCards = gameService.dealCards(
        gameId,
        dealRequest.getPlayerId(),
        dealRequest.getAmount()
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(dealtCards);
  }

  @GetMapping("/{gameId}/players/{playerId}/cards")
  public List<Card> getPlayerHand(@PathVariable UUID gameId, @PathVariable UUID playerId) {
    return gameService.getPlayerHand(gameId, playerId);
  }

  @GetMapping("/{gameId}/players")
  public List<PlayerScoreResponse> getPlayersWithScores(@PathVariable UUID gameId) {
    return gameService.getPlayersWithScores(gameId);
  }

  @GetMapping("/{gameId}/deck")
  public DeckInfoResponse getDeckInfo(@PathVariable UUID gameId) {
    return gameService.getDeckInfo(gameId);
  }

  @PostMapping("/{gameId}/shuffle")
  public ResponseEntity<Void> shuffleGameDeck(@PathVariable UUID gameId) {
    gameService.shuffle(gameId);
    return ResponseEntity.ok().build();
  }

  @ExceptionHandler(NoSuchElementException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Map<String, String> handleNoSuchElementException(NoSuchElementException e) {
    return Collections.singletonMap("error", e.getMessage());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleIllegalArgumentException(IllegalArgumentException e) {
    return Collections.singletonMap("error", e.getMessage());
  }
}