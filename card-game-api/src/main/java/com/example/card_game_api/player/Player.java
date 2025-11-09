/*
* The model for the player.
*
* It contains it's hand as a Card list and a name.
*/

package com.example.card_game_api.player;

import com.example.card_game_api.card.Card;

import com.example.card_game_api.game.Game;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.UUID;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Player {

  @Id
  private UUID id;
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "game_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Game game;

  @ElementCollection
  @CollectionTable(name = "player_hand", joinColumns = @JoinColumn(name = "player_id"))
  @OrderColumn
  private List<Card> hand = new ArrayList<>();

  public Player(String name, Game game) {
    this.id = UUID.randomUUID();
    this.name = name;
    this.game = game;
  }
}
