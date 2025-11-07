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