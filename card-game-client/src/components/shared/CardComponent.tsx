import { Card } from "../../types/api";
import './CardComponent.css'

type CardProps = {
  card: Card;
};

export function CardComponent({card}: CardProps): React.ReactElement {
  return (
    <span className="card">
      {card.rank} of {card.suit}
    </span>
  );
}