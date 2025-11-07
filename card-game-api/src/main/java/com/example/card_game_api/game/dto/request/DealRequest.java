package com.example.card_game_api.game.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class DealRequest {
  private UUID playerId;
  private int amount = 1;
}