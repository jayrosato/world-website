import HomeImageCarousel from './homeImageCarousel'
import styles from '../styles/home.module.css'

import { useState } from 'react'


function App() {
  function Card({ id, title, image, description, isExpanded, onClick }) {
    return (
      <div className={`${styles.card} ${isExpanded ? styles.active : ""}`} onClick={onClick}>
        <div className={styles.cardInfo}>
          <img src={image} className={styles.cardImage} />
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {isExpanded && (
          <div className={styles.cardExpanded}>
            <h2>Explore the Company</h2>
            <p>Expanded text</p>
            <a href="/faiths">Link here</a>
          </div>
        )}
      </div>
    );
  }

  function CardList() {
    const [expandedCardId, setExpandedCardId] = useState(null);
    const cards = [
      { id: 1, title: "The Company", image: "/mfi_ruthless.png", description: "Company description here." },
      { id: 2, title: "The Company", image: "/mfi_ruthless.png", description: "Company description here." },
      { id: 3, title: "The Company", image: "/mfi_ruthless.png", description: "Company description here." },
      { id: 4, title: "The Company", image: "/mfi_ruthless.png", description: "Company description here." },
    ];
  
    return (
      <div className={styles.highlight}>
        {cards.map(card => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            image={card.image}
            description={card.description}
            isExpanded={expandedCardId == card.id}
            onClick={() => setExpandedCardId(expandedCardId == card.id ? null : card.id)}
          />
        ))}
      </div>
    );
  }


  return (
    <>
      <div className={styles.featured}>
          <HomeImageCarousel />
      </div>
      <div className={styles.highlight}>
          <CardList />
      </div>
    </>
  )
}

export default App
