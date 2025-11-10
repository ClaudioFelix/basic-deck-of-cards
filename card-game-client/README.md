# Card Game Client - React Frontend

This project is the client for the **Card Game Spring Boot API**. It is a single-page application (SPA) built using React and TypeScript.

This application provides a user interface to interact with all features of the backend API, including managing multiple game sessions, adding/removing players, dealing cards, and viewing the real-time state of any active game.

## Features

  * **Game Lobby System:**
      * Fetch and display a list of all available games from the backend.
      * Create new game sessions.
      * Delete existing game sessions.
      * Load any game to make it the "active" session.
  * **Active Game Dashboard:**
      * **Player Management:** Add new players by name and remove players from the game.
      * **Deck Controls:** Add a new 52-card deck to the shoe and shuffle the shoe at any time.
      * **Deal Cards:** Select a specific player and deal a custom number of cards to them.
  * **Real-time State Display:**
      * **Player Scores:** Automatically displays a sorted list of all players and their current hand scores.
      * **Player Hands:** View the complete list of cards for every player in the game.
      * **Deck Information:** View a detailed breakdown of the undealt deck, including total remaining cards and a count by suit.

## Tech Stack

  * **Library:** React 18+ (with Hooks)
  * **Language:** TypeScript
  * **State Management:** React Context (`useContext`) & Custom Hooks
  * **API Communication:** Browser `fetch` API (`async/await`)
  * **Testing:** Jest & React Testing Library (with `user-event`)
  * **Styling:** Standard CSS (modularized by component)

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

You will need the following tools installed on your system:

  * [Node.js](https://nodejs.org/) (v16 or newer)
  * `npm` (which comes with Node.js)
  * **Crucially, the([Backend API](https://github.com/ClaudioFelix/basic-deck-of-cards/tree/main/card-game-api)) must be running** on `http://localhost:8080` for this frontend to function.

### Installation & Running

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/card-game-client.git
    cd card-game-client
    ```

2.  **Install dependencies:**
    This will install React and all other necessary packages.

    ```bash
    npm install
    ```

3.  **Run the application:**
    This starts the React development server, which will automatically open in your browser.

    ```bash
    npm start
    ```

The application will be available and running at **[http://localhost:3000](http://localhost:3000)**.

## Running Tests

This project is configured with a test suite using React Testing Library.

### Interactive Watch Mode (Recommended for Development)

This command will launch the test runner in interactive mode. It automatically re-runs tests when you save a file.

```bash
npm test
```

### Single Run (For CI/CD)

This command runs all tests once and provides a final report.

```bash
CI=true npm test
```