import Navbar from './navbar'
import styles from '../styles/app.module.css'
function App() {

  return (
    <>
      <Navbar />
      <div className={styles.firstImg}>
        <div className={styles.frontText}>
          <h1>Explore the World!</h1>
          <p>Begin your journey into the world of Amadya!</p>
          <button>Click here to begin!</button>
        </div>
      </div>
      <div className={styles.featured}>
          <h1>Explore the World!</h1>
          <p>Begin your journey into the world of Amadya!</p>
          <button>Click here to begin!</button>
      </div>

    </>
  )
}

export default App
