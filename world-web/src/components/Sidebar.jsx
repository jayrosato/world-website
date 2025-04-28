import styles from '../styles/sidebar.module.css'
import { useAuth } from './UserAuth'
import { useState, useEffect } from 'react';


function Profile() {
    const { user } = useAuth();
    if (!user){
        return(<a href='http://localhost:5173/login'>Login</a>)
    }
    else{
        return(
        <>
            <a href='http://localhost:5173/profile'>Welcome, {user.username}</a>
        </>
        )
    }
}

export default function Sidebar(){

    return(
        <div className={styles.sidebar}>
            <Profile />
            <div className={styles.sbLinks}>
                <a href='/faiths'> <div className={styles.link}>
                    <img className={styles.sbIcon} src='../public/thumb-up.svg'/>
                    <p>Faiths</p>
                </div></a>
            </div>
        </div>
    )
} 