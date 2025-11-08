package com.example.card_game_api.game.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class GameSummaryResponse {
  private UUID gameId;
  private int playerCount;
}