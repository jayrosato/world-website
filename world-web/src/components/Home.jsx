import styles from '../styles/home.module.css'

import { useState } from 'react'

function Menu(){
  return(
    <div className={styles.menu}>
      <div className={styles.menuBox} style={{ '--i': 1 }}>
        <img className={styles.menuIcon} src='/house.png' />
        <p>Line 1</p>
      </div>
      <div className={styles.menuBox} style={{ '--i': 2 }}>
        <img className={styles.menuIcon} src='/house.png' />
        <p>Line 2</p>
      </div>
      <div className={styles.menuBox} style={{ '--i': 3 }}>
        <img className={styles.menuIcon} src='/house.png' />
        <p>Line 3</p>
      </div>
    </div>
  )
}

function HeaderTabs(){
  return(
    <div className={styles.headerTabs}>
        <div className={styles.headerTab} style={{ '--i': 1 }}>
          <img className={styles.menuIcon} src='/house.png' />
          <p>Line 1</p>
        </div>
        <div className={styles.headerTab} style={{ '--i': 2 }}>
          <img className={styles.menuIcon} src='/house.png' />
          <p>Line 2</p>
        </div>
        <div className={styles.headerTab} style={{ '--i': 3 }}>
          <img className={styles.menuIcon} src='/house.png' />
          <p>Line 3</p>
        </div>
      </div>
  )
}
function App(){
    const[headerTabs, setHeaderTabs] = useState(false)
    const[menu, setMenu] = useState(false)

    return(
      <>
        <div className={styles.header} onMouseEnter={() => setHeaderTabs(true)} onMouseLeave={() => setHeaderTabs(false)}></div>
        {headerTabs ? <HeaderTabs /> : null}
        
        <div className={styles.frame}>

          <div className={styles.menuTrigger} onClick={() => setMenu(!menu)}></div>
            {menu ? <Menu /> : null}
        </div>

          <div className={styles.homeContent}>
            <img className={styles.art} src='/art.png' />

            <div className={styles.openText}>
              <p>There would be ideally a decent amount of text here.</p>
            </div>
          </div>
          
        <div className={styles.test}>

        </div>
      </>
    )
}

export default App
