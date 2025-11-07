package com.example.card_game_api.game.dto.response;

import com.example.card_game_api.card.Card;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class DeckInfoResponse {
  private int totalCards;
  private Map<String, Long> suitCounts;
  private List<Card> sortedCards;
}