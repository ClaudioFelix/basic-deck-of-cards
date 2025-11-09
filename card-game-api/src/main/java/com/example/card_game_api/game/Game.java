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
import jakarta.persistence.*;
import lombok.Data;

import java.util.*;

@Entity
@Data
public class Game {

  @Id
  private UUID id;

  @ElementCollection
  @CollectionTable(name = "game_deck", joinColumns = @JoinColumn(name = "game_id"))
  @OrderColumn
  private final List<Card> gameDeck = new ArrayList<>();

  @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<Player> players = new ArrayList<>();

  public Game() {
    this.id = UUID.randomUUID();
  }
}