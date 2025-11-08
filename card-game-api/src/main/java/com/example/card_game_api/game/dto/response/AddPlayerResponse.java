package com.example.card_game_api.game.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AddPlayerResponse {
  private UUID playerId;
  private String playerName;
}
