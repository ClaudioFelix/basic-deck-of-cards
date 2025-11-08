package com.example.card_game_api.game;

import com.example.card_game_api.card.*;
import com.example.card_game_api.game.dto.response.*;
import com.example.card_game_api.game.dto.request.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private GameService gameService;

  @Test
  void getAllGames_shouldReturn200AndGameList() throws Exception {
    // Arrange
    GameSummaryResponse summary1 = new GameSummaryResponse(UUID.randomUUID(), 0);
    GameSummaryResponse summary2 = new GameSummaryResponse(UUID.randomUUID(), 2);
    List<GameSummaryResponse> summaries = List.of(summary1, summary2);

    when(gameService.getAllGames()).thenReturn(summaries);

    // Act & Assert
    mockMvc.perform(get("/games"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0]gameId", is(summary1.getGameId().toString())))
        .andExpect(jsonPath("$[0]playerCount", is(0)))
        .andExpect(jsonPath("$[1]gameId", is(summary2.getGameId().toString())))
        .andExpect(jsonPath("$[1]playerCount", is(2)));
  }

  @Test
  void createGame_shouldReturn201AndGame() throws Exception {
    Game game = new Game();
    UUID gameId = game.getId();
    when(gameService.createGame()).thenReturn(game);

    mockMvc.perform(post("/games"))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", startsWith("http://localhost/games/")))
        .andExpect(jsonPath("$.id", is(gameId.toString())));
  }

  @Test
  void deleteGame_shouldReturn204() throws Exception {
    mockMvc.perform(delete("/games/" + UUID.randomUUID()))
        .andExpect(status().isNoContent());
  }

  @Test
  void deleteGame_whenNotFound_shouldReturn404() throws Exception {
    UUID gameId = UUID.randomUUID();
    doThrow(new NoSuchElementException("Game not found")).when(gameService).deleteGame(gameId);

    mockMvc.perform(delete("/games/" + gameId))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error", is("Game not found")));
  }

  @Test
  void addDeckToGame_shouldReturn200Ok() throws Exception {
    mockMvc.perform(post("/games/" + UUID.randomUUID() + "/add-deck"))
        .andExpect(status().isOk());
  }

  @Test
  void shuffleGameDeck_shouldReturn200Ok() throws Exception {
    mockMvc.perform(post("/games/" + UUID.randomUUID() + "/shuffle"))
        .andExpect(status().isOk());
  }

  @Test
  void addPlayer_shouldReturn201AndPlayerId() throws Exception {
    UUID gameId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();
    when(gameService.addPlayer(gameId, "name")).thenReturn(playerId);

    AddPlayerRequest addPlayerRequest = new AddPlayerRequest();
    addPlayerRequest.setName("name");

    mockMvc.perform(post("/games/" + gameId + "/players")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addPlayerRequest)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", startsWith("http://localhost/games/" + gameId + "/players/")))
        .andExpect(jsonPath("$.playerId", is(playerId.toString())));
  }

  @Test
  void removePlayer_shouldReturn204() throws Exception {
    mockMvc.perform(delete("/games/" + UUID.randomUUID() + "/players/" + UUID.randomUUID()))
        .andExpect(status().isNoContent());
  }

  @Test
  void dealCards_shouldReturn201AndCards() throws Exception {
    UUID gameId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();
    DealRequest dealRequest = new DealRequest();
    dealRequest.setPlayerId(playerId);
    dealRequest.setAmount(5);

    List<Card> cards = Collections.singletonList(new Card(Suit.HEARTS, Rank.ACE));
    when(gameService.dealCards(gameId, playerId, 5)).thenReturn(cards);

    mockMvc.perform(post("/games/" + gameId + "/deal-cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dealRequest)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].suit", is("HEARTS")))
        .andExpect(jsonPath("$[0].rank", is("ACE")));
  }

  @Test
  void getPlayerHand_shouldReturn200AndCards() throws Exception {
    UUID gameId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();
    List<Card> cards = Collections.singletonList(new Card(Suit.SPADES, Rank.TEN));
    when(gameService.getPlayerHand(gameId, playerId)).thenReturn(cards);

    mockMvc.perform(get("/games/" + gameId + "/players/" + playerId + "/cards"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].suit", is("SPADES")))
        .andExpect(jsonPath("$[0].rank", is("TEN")));
  }

  @Test
  void getPlayersWithScores_shouldReturn200AndSortedList() throws Exception {
    UUID gameId = UUID.randomUUID();
    UUID player1 = UUID.randomUUID(); // Score 10
    UUID player2 = UUID.randomUUID(); // Score 12
    List<PlayerScoreResponse> scores = Arrays.asList(
        new PlayerScoreResponse(player2, "name1", 12),
        new PlayerScoreResponse(player1, "name2", 10)
    );
    when(gameService.getPlayersWithScores(gameId)).thenReturn(scores);

    mockMvc.perform(get("/games/" + gameId + "/players"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$.[0]playerId", is(player2.toString())))
        .andExpect(jsonPath("$.[0]totalValue", is(12)))
        .andExpect(jsonPath("$.[1]playerId", is(player1.toString())))
        .andExpect(jsonPath("$.[1]totalValue", is(10)));
  }

  @Test
  void getDeckInfo_shouldReturn200AndDeckInfo() throws Exception {
    UUID gameId = UUID.randomUUID();
    Map<String, Long> counts = Map.of("HEARTS", 5L, "SPADES", 0L, "CLUBS", 0L, "DIAMONDS", 0L);
    List<Card> sortedCards = List.of(new Card(Suit.HEARTS, Rank.KING));

    DeckInfoResponse response = new DeckInfoResponse(5, counts, sortedCards);
    when(gameService.getDeckInfo(gameId)).thenReturn(response);

    mockMvc.perform(get("/games/" + gameId + "/deck")) // ATUALIZADO: URL
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalCards", is(5)))
        .andExpect(jsonPath("$.suitCounts.HEARTS", is(5)))
        .andExpect(jsonPath("$.sortedCards", hasSize(1)))
        .andExpect(jsonPath("$.sortedCards[0].rank", is("KING")));
  }
}