/*
* This is a simple model for a card. A card is a pair of a suit and a rank.
*/

package com.example.card_game_api.card;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Card {

  @Enumerated(EnumType.STRING)
  private Suit suit;

  @Enumerated(EnumType.STRING)
  private Rank rank;
}