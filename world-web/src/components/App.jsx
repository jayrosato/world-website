import Navbar from './navbar'
import HomeImageCarousel from './homeImageCarousel'
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
          <HomeImageCarousel />
      </div>
      
      <div className={styles.featuredII}>
          <h1>See what's new!</h1>
          <p>Check it out!</p>
          <button>Look here!</button>
      </div>
      <div className={styles.footer}>
          <h3>Footer</h3>
          <p>Footer text</p>
      </div>

    </>
  )
}

export default App
