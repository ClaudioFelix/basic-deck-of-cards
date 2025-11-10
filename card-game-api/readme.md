# Basic Deck of Cards - Spring Boot REST API

This project is a complete, production-ready RESTful API for a basic deck of poker-style playing cards. It provides a full set of endpoints to manage multiple games, add/remove players, shuffle decks, deal cards, and query game state.

This backend is built with Spring Boot, Spring Data JPA, and an H2 in-memory database. It is designed to demonstrate a clean, layered architecture and modern RESTful design principles. It is fully configured to connect with its [client application](https://github.com/ClaudioFelix/basic-deck-of-cards/tree/main/card-game-client).

## Features

* **Game Management:** Create, delete, and list all active games.
* **Player Management:** Add (with a name) and remove players from a specific game.
* **Deck Operations:** Add one or more 52-card standard decks to a game's "shoe."
* **Custom Shuffle:** A custom Fisher-Yates shuffle algorithm (non-library) for the game deck.
* **Gameplay:** Deal a specified number of cards from the shoe to a specific player.
* **State Querying:**
    * Get a list of all players in a game with their hand values, sorted from highest to lowest.
    * Get the specific hand of cards for a single player.
    * Get detailed info on the undealt cards (total count, count by suit, and a sorted list).

## Tech Stack

* **Framework:** Spring Boot 3.x
* **Language:** Java 17
* **Data Persistence:** Spring Data JPA & Hibernate
* **Database:** H2 In-Memory Database
* **Build:** Apache Maven
* **API Documentation:** `springdoc-openapi` (Swagger UI)
* **Utilities:** Lombok
* **Testing:** JUnit 5, Mockito, Spring Boot Test

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

You will need the following tools installed on your system:

* Java JDK 17 or newer
* Apache Maven

### Installation & Running

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/card-game-api.git
    cd card-game-api
    ```

2.  **Build the project using Maven:**
    This will compile the code and download all required dependencies.

    ```bash
    ./mvnw clean install
    ```

3.  **Run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```

The application will start on the default port `8080`.

### Available Endpoints

Once the application is running, you can access the following key locations:

* **API (Swagger) Documentation:**
  An interactive API documentation (Swagger UI) is available to view and test all endpoints.
  [http://localhost:8080/swagger-ui.html](https://www.google.com/search?q=http://localhost:8080/swagger-ui.html)

* **H2 Database Console:**
  You can directly inspect the in-memory database using the H2 console.
  [http://localhost:8080/h2-console](https://www.google.com/search?q=http://localhost:8080/h2-console)

    * **JDBC URL:** `jdbc:h2:mem:cardgamedb` (You must use this exact URL)
    * **User Name:** `sa`
    * **Password:** (leave blank)

## Project Architecture

This project follows a **Layered Architecture** to ensure a clean separation of concerns. We also apply the **Package-by-Feature** principle to group related logic together.

## API Endpoints

All endpoints are available under the `/games` base path.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/games` | Creates a new, empty game. |
| `GET` | `/games` | Lists all active games (summary view). |
| `GET` | `/games/{gameId}` | Gets detailed information for a single game. |
| `DELETE` | `/games/{gameId}` | Deletes a game and all its players. |
| `POST` | `/games/{gameId}/deck/standard-decks` | Adds a new 52-card deck to the shoe. |
| `POST` | `/games/{gameId}/deck/shuffle` | Shuffles the game's deck. |
| `GET` | `/games/{gameId}/deck` | Gets detailed info on the undealt cards (count, suits, sorted list). |
| `POST` | `/games/{gameId}/players` | Adds a new player to the game. (Body: `{"name": "string"}`). |
| `DELETE` | `/games/{gameId}/players/{playerId}` | Removes a player from the game. |
| `GET` | `/games/{gameId}/players` | Gets the list of players and their scores, sorted high-to-low. |
| `GET` | `/games/{gameId}/players/{playerId}/cards` | Gets the specific hand for a single player. |
| `POST` | `/games/{gameId}/deals` | Deals cards to a player. (Body: `{"playerId": "uuid", "amount": int}`). |

## Running Tests

To run the complete suite of unit and integration tests, execute the following command from the project's root directory:

```bash
./mvnw test
```