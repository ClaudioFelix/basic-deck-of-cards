import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardComponent } from './CardComponent';
import { Card } from '../../types/api';

describe('GameCard Component', () => {
  test('should render the suit and rank of the card', () => {
    const mockCard: Card = { suit: 'HEARTS', rank: 'ACE' };
    
    render(<CardComponent card={mockCard} />);

    expect(screen.getByText(/ACE of HEARTS/i)).toBeInTheDocument();
  });
});