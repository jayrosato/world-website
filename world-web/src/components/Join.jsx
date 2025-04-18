import { useState } from "react";
import { useAuth } from './UserAuth'
import { useNavigate } from "react-router-dom";

export default function Join() {
    const { user } = useAuth()
    const {setLoggedIn, setUser} = useAuth();
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState('');
    const[username, setUsername] = useState('')
    const[email, setEmail] = useState('')
    const[password, setPass] = useState('')
    const[confirmPassword, setConfirmPass] = useState('')

    

    const handleSubmit= async ()=>{
        try{
            const response = await fetch("http://localhost:3000/join", {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword,
                    email: email,
                  })
            });
            const data = await response.json();

            if (response.status === 200) {
                setLoggedIn(true);
                setUser(data.user)
                navigate('/');
            } 
            else {
                const errorMessages = data.errors.map(error => error.msg);
                setErrorMsg(errorMessages);
            }
        } 
        catch (err) {
            console.error('Network or server error', err);
            setErrorMsg('Something went wrong.');
        }
    };
    

    return(
        <div>
            <h1>Login</h1>
            <input type="text" name='username' value={username} onChange={(event) => setUsername(event.target.value)}/>
            <label>Username</label>
            <input type="text" name='email' value={email} onChange={(event) => setEmail(event.target.value)}/>
            <label>Email</label>
            <input type="password" name='password' value={password} onChange={(event) => setPass(event.target.value)}/>
            <label>Pass</label>
            <input type="password" name='confirmPassword' value={confirmPassword} onChange={(event) => setConfirmPass(event.target.value)}/>
            <label>Confirm Pass</label>
            {errorMsg && errorMsg.map((msg, index) => (
                <p key={index} style={{ color: 'red' }}>{msg}</p>
            ))}
            <button onClick={()=>handleSubmit()}>Create</button>
        </div>
    )

}