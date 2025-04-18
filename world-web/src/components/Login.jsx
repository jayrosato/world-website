import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './UserAuth'

export default function LoginComponent() {
  const {setLoggedIn, setUser} = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const[email, setEmail] = useState('')
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
          username: email,
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
    <div>
        <h1>Login</h1>
        <input type="text" value={email} onChange={(event) => setEmail(event.target.value)}/>
        <label>Email</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
        <label>Pass</label>
      <button onClick={getLoginResponse}>Login</button>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <a href="/join"><button>Create Account</button></a>
    </div>
  );
}