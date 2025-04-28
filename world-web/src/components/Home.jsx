import HomeImageCarousel from './homeImageCarousel'
import styles from '../styles/home.module.css'
function App() {

  return (
    <>
      <div className={styles.featured}>
          <HomeImageCarousel />
      </div>
    </>
  )
}

export default App
