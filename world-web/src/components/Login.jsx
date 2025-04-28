import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './UserAuth'

import styles from '../styles/login.module.css'
export default function LoginComponent() {
  const {setLoggedIn, setUser} = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const[username, setUsername] = useState('')
  const[password, setPassword] = useState('')
  const navigate = useNavigate();

  const getLoginResponse = async () => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        setLoggedIn(true);
        setUser(data.user)
        navigate('/');
      } 
      else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || "Login failed");
      }
    } catch (err) {
      console.error('Network or server error', err);
      setErrorMsg('Something went wrong.');
    }
  };

  return (
      <div className={styles.content}>
        <div className={styles.loginbox}>
          <h1>Login</h1>
          <label>Username or Email</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)}/>
          
          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
          
          <button onClick={getLoginResponse}>Login</button>
          <a href="/join"><button>Create Account</button></a>
          <div className={styles.errors}>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          </div>
        </div>
      </div>
  );
}