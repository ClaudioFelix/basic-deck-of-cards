/*
* The game model.
*
* It uses a LinkedDeque as gameDeck type for efficient polling
* from the shoe, in terms of assigning the next top card.
*
* It also contains the players list mapped by their ids.
*/

package com.example.card_game_api.game;

import com.example.card_game_api.card.Card;
import com.example.card_game_api.player.Player;
import lombok.Data;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.Map;
import java.util.Deque;

@Data
public class Game {
  private final UUID id;
  private final Deque<Card> gameDeck = new ConcurrentLinkedDeque<>();
  private final Map<UUID, Player> players = new ConcurrentHashMap<>();

  public Game() {
    this.id = UUID.randomUUID();
  }
}