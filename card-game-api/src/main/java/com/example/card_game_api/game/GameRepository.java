/*
* Classic Repository implementation.
*
* Methods: save(Game game), findById(UUID id), findAll(), deleteById(UUID id)
*/

package com.example.card_game_api.game;

import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class GameRepository {
  private final Map<UUID, Game> games = new ConcurrentHashMap<>();

  public Game save(Game game) {
    games.put(game.getId(), game);
    return game;
  }

  public Optional<Game> findById(UUID id) {
    return Optional.ofNullable(games.get(id));
  }

  public Collection<Game> findAll() {
    return games.values();
  }

  public void deleteById(UUID id) {
    if (!games.containsKey(id)) {
      throw new NoSuchElementException("Game not found");
    }
    games.remove(id);
  }
}
