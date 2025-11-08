package com.example.card_game_api.game.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class PlayerScoreResponse implements Comparable<PlayerScoreResponse> {
  private UUID playerId;
  private String playerName;
  private int totalValue;

  @Override
  public int compareTo(PlayerScoreResponse other) {
    // Sort in descending order (highest value first)
    return Integer.compare(other.totalValue, this.totalValue);
  }
}