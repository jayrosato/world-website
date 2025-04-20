import Navbar from './navbar';
import { useState, useEffect } from 'react';
import { useAuth } from './UserAuth'
import styles from '../styles/profile.module.css'
import { useNavigate } from "react-router-dom";

export default function ProfileComponent (){
    const navigate = useNavigate();
    
    const { user, setUser, setLoggedIn } = useAuth();
    const [id, setId] = useState('')
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [msg, setMsg] = useState('');

    const[view, setView] = useState('view')
    const[confirmDelete, setConfirmDelete] = useState()
    useEffect(() => {
        if (user) {
            setId(user.id)
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
                setView('view')
                setMsg('All changes saved succesfuly!')
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

    async function deleteProfile(){
        const url = `http://localhost:3000/profile/${id}/delete`
        try{
            const response = await fetch(url, { 
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: id
                  })
            });
            const data = await response.json();
            if (response.status === 200) {
                setLoggedIn(false);
                setUser(null)
                setMsg('Profile deleted.')
                navigate('/')
            } 
            else {
                const errorMessages = data.errors.map(error => error.msg);
                setErrorMsg(errorMessages);
            }
        }
        catch (err) {
            console.error('Network or server error', err);
        }
    }

    if(view=='view'){
        return(
            <div>
            <Navbar />
            <div className={styles.content}>
                <div className={styles.fields}>
                    <p>Username: </p>
                    <p>{username}</p>
                    <p>Email: </p>
                    <p>{email}</p>
                </div>
                <button onClick={()=>setView('edit')}>Edit Profile</button>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                <button className={styles.deleteButton} onClick={()=>setView('delete')}>Delete Profile</button>
            </div>
            </div>
        )
    }


    if(view=='edit'){
        return (
            <div>
            <Navbar />
            <div className={styles.content}>
                <div className={styles.fields}>
                    <label>Username</label>
                    <input type='text' value={username} onChange={(event) => setUsername(event.target.value)}/>
                    <label>Email</label>
                    <input type='email' value={email} onChange={(event) => setEmail(event.target.value)}/>
                </div>
                <button onClick={()=>handleSubmit()}>Save Changes</button>
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            </div>
            </div>
        );
    }
    if(view=='delete'){
        if(confirmDelete == username){
            return(
                <>
                    <Navbar />
                    <div className={styles.content}>
                        <div className={styles.delete}>
                            <p>Are you sure you want to delete your profile? This action cannot be undone</p>
                            <input type='text' name='password' value={confirmDelete} onChange={(event) => setConfirmDelete(event.target.value)}/>
                        </div>
                        <button className={styles.deleteButton} onClick={() => deleteProfile()}>Delete profile</button>
                        <button onClick={()=>setView('view')}>Nevermind</button>
                    </div>
                </>
            )
        }
        else{
            return(
                <>
                    <Navbar />
                    <div className={styles.content}>
                        <p>Are you sure you want to delete your profile? This action cannot be undone</p>
                        <input type='text' name='password' value={confirmDelete} onChange={(event) => setConfirmDelete(event.target.value)}/>
                        <button onClick={()=>setView('view')}>Nevermind</button>
                    </div>
                </>
            )
        }
    }
}

