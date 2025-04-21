import Navbar from './navbar';
import { useState, useEffect } from 'react';
import { useAuth } from './UserAuth'
import styles from '../styles/create-post.module.css'
import { useNavigate } from "react-router-dom";

export default function CreatePost (){
    const navigate = useNavigate();
    
    const { user } = useAuth();
    const [id, setId] = useState(null)
    const [errorMsg, setErrorMsg] = useState('');

    const[title, setTitle] = useState('')
    const[text, setText] = useState('')

    useEffect(() => {
        if (user) {
            setId(user.id)
        }},[user])

    async function handleSubmit(){
        try{
            const response = await fetch("http://localhost:3000/forum/create", {
                method: 'POST',
                //credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    author: id,
                    title: title,
                    text: text,
                    parent_post: null
                  })
            });
            const data = await response.json();

            if (response.status === 200) {
                navigate(`/forum/`)
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

        return (
            <div>
            <Navbar />
            <div className={styles.content}>
                <div className={styles.fields}>
                    <label>Post Title</label>
                    <input type='text' value={title} onChange={(event) => setTitle(event.target.value)}/>
                    <label>Post Text</label>
                    <input type='text' value={text} onChange={(event) => setText(event.target.value)}/>
                </div>
                <button onClick={()=>handleSubmit()}>Post to Forum</button>
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            </div>
            </div>
        );
}

