import Navbar from './navbar';
import { useState, useEffect } from 'react';
import { useAuth } from './UserAuth'
import styles from '../styles/profile.module.css'

export default function ProfileComponent (){
    const { user, setUser, setLoggedIn } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [msg, setMsg] = useState('');

    const[view, setView] = useState('view')
    useEffect(() => {
        if (user) {
          setUsername(user.username);
          setEmail(user.email);
        }},[user])

    async function handleSubmit(){
        try{
            const response = await fetch("http://localhost:3000/profile/"+user.id, {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username: username,
                    email: email,
                  })
            });
            const data = await response.json();

            if (response.status === 200) {
                setLoggedIn(true);
                setUser(data.user)
                setMsg('Changes saved successfuly')
                setView('view')
            } 
            else {
                const errorMessages = data.errors.map(error => error.msg);
                setErrorMsg(errorMessages);
            }
        } 
        catch (err) {
            console.error('Network or server error', err);
        }
    };

    if(view=='view'){
        return(
            <div>
            <Navbar />
            <div className={styles.content}>
                <p>Username: {username}</p>
                <p>Email: {email}</p>
                <button onClick={()=>setView('edit')}>Edit Profile</button>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
            </div>
            </div>
        )
    }


    if(view=='edit'){
        return (
            <div>
            <Navbar />
            <div className={styles.content}>
                <label>Username</label>
                <input type='text' value={username} onChange={(event) => setUsername(event.target.value)}/>
                <label>Email</label>
                <input type='email' value={email} onChange={(event) => setEmail(event.target.value)}/>
                <button onClick={()=>handleSubmit()}>Save Changes</button>
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            </div>
            </div>
        );
    }
}

