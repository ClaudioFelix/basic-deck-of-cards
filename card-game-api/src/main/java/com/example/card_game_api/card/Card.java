/*
* This is a simple model for a card. A card is a pair of a suit and a rank.
*/

package com.example.card_game_api.card;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@AllArgsConstructor
@EqualsAndHashCode
public class Card {
  private Suit suit;
  private Rank rank;
}