# Full-Stack Card Game API Project

This repository contains the complete full-stack implementation of a multi-game, multi-player card game application. The project is separated into two distinct services: a RESTful API backend built with Spring Boot and a single-page application built with React.

  * **Backend:**(./card-game-api/README.md)
  * **Frontend:**(./card-game-client/README.md)

## Overview

This application simulates a basic poker-style card game environment. The backend manages the game state, persistence, and business logic, while the frontend provides a interactive UI for users to manage and play the games.

### Backend (`card-game-api/`)

The backend is a Java 17 application built with **Spring Boot 3**. It exposes a RESTful API to handle all game logic.

  * **Architecture:** Follows a package-by-feature architecture with persistence managed by **Spring Data JPA**.
  * **Database:** Uses **H2 In-Memory Database** for state persistence, allowing the application to be run and tested without any external database setup.
  * **API Documentation:** Includes `springdoc-openapi` for **Swagger UI** generation.
  * **Testing:** Features a test suite with JUnit 5 and Mockito.

### Frontend (`card-game-client/`)

The frontend is a client application built with **React 18 and TypeScript**.

  * **Architecture:** Separates concerns:
      * **`components/`**: Dumb, reusable UI components.
      * **`hooks/`**: Custom hooks for managing complex local state and business logic.
      * **`context/`**: React Context API for managing global state (e.g., the active game ID, game list).
      * **`services/`**: A dedicated API layer for isolating all `fetch` communication.
      * **`types/`**: Centralized TypeScript definitions that act as the API contract.
  * **State Management:** Uses a combination of `useState` and `useCallback` in custom hooks, with a global `GameContext` to manage the session state.
  * **Testing:** Includes a test suite using React Testing Library and Jest, with tests for services, hooks, and components.

## Core Features

This full-stack application allows users to:

  * **Manage Multiple Games:** Create, view a list of, load, and delete multiple game sessions from a central "Lobby."
  * **Switch Contexts:** Swap between active games, with the UI automatically updating to reflect the selected game's state.
  * **Manage Players:** Add new players to an active game and remove them.
  * **Control the Deck:** Add one or more 52-card decks to a game's "shoe" and shuffle the shoe at any time.
  * **Deal Cards:** Deal a specified number of cards from the shoe to any player in the game.
  * **View Real-time State:** The UI automatically updates to show the sorted scores, the contents of each player's hand, and a detailed breakdown of the remaining deck.

## Prerequisites

To run this full-stack application, you will need the following tools:

  * **Java 17 (or newer):** To run the Spring Boot backend.
  * **Maven 3.5+:** To build the backend and manage its dependencies.
  * **Node.js (v16 or newer):** To run the React frontend.
  * **npm 8+** (or `yarn`): To manage the frontend dependencies.

## How to Run the Full Application

To run the complete application, you must start both the backend service and the frontend client in two separate terminals.

### 1\. Run the Backend

Start the Spring Boot API, which will run on `http://localhost:8080`.

```bash
cd card-game-api

./mvnw clean install

./mvnw spring-boot:run
```

The API is now running. You can access the Swagger UI at `http://localhost:8080/swagger-ui.html` and the H2 Database console at `http://localhost:8080/h2-console` (use JDBC URL: `jdbc:h2:mem:cardgamedb`).

### 2\. Run the Frontend (Terminal 2)

Start the React client, which will run on `http://localhost:3000`.

```bash
cd card-game-client

npm install

npm start
```

The React app is already configured to make API requests to the backend service running on `http://localhost:8080`.