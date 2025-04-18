import styles from '../styles/navbar.module.css'
import { useAuth } from './UserAuth'

function Profile() {
    const { user } = useAuth();
    if (!user){
        return(<a href='http://localhost:5173/login'>Login</a>)
    }
    else{
        return(
        <>
            <a href='http://localhost:5173/profile'>Welcome, {user.username}</a>
            <a href='http://localhost:5173/logout'>Log Out</a>
        </>
        )
    }
}


export default function Navbar(){
    return(
        <nav className={styles.header}>
            <div className={styles.branding}>
                <a href='http://localhost:5173'><img className={styles.navbarIcon} src='../public/mfi_sethianism.png' alt='temp logo' /></a>
                <a href='http://localhost:5173' className={styles.navbarName}><h1>Epic World Here!</h1></a>
            </div>
            <div className={styles.links}>
                <a href='http://localhost:5173/faiths'> Realms </a>
                <a href='http://localhost:5173/faiths'> Faiths </a>
                <a href='http://localhost:5173/forum'> Forum </a>
                <Profile />
            </div>
        </nav>
    )
}