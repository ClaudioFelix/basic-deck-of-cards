import { Card, DeckInfo } from "../types/api";

export const emptyTotalCards = 0

export const emptySuitCounts = {
        "HEARTS": 0,
        "SPADES": 0,
        "DIAMONDS": 0,
        "CLUBS": 0
      }

export const emptySortedCards: Card[] = []

export const emptyDeckInfo: DeckInfo = {totalCards: emptyTotalCards, suitCounts: emptySuitCounts, sortedCards: emptySortedCards}