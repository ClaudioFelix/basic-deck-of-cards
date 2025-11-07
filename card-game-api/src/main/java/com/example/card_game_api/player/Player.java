/*
* The model for the player.
*
* It contains it's hand as a Card list and a name.
*/

package com.example.card_game_api.player;

import com.example.card_game_api.card.Card;

import java.util.UUID;
import java.util.List;

public class Player {
  private final UUID id;
  private List<Card> hand;
  private String name;

  public Player() {
    this.id = UUID.randomUUID();
  }
}
