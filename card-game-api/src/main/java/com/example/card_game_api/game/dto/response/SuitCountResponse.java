package com.example.card_game_api.game.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class SuitCountResponse {
  // e.g., {"HEARTS": 5, "SPADES": 3,...}
  private Map<String, Long> suitCounts;
}
