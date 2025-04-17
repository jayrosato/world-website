import { useState } from "react";

export default function Join() {
    const[username, setUsername] = useState('')
    const[email, setEmail] = useState('')
    const[pass, setPass] = useState('')
    const[confirmPass, setConfirmPass] = useState('')

    const handleSubmit=()=>{
        console.log(email, pass)
        const data={
            username: username,
            email: email,
            password: pass,
            confirmPassword: confirmPass,
        }
        fetch("http://localhost:3000/join/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data) 
            })
          }

    return(
        <div>
            <h1>Login</h1>
            <input type="text" name='username' value={username} onChange={(event) => setUsername(event.target.value)}/>
            <label>Username</label>
            <input type="text" name='email' value={email} onChange={(event) => setEmail(event.target.value)}/>
            <label>Email</label>
            <input type="password" name='password' value={pass} onChange={(event) => setPass(event.target.value)}/>
            <label>Pass</label>
            <input type="password" name='confirmPassword' value={confirmPass} onChange={(event) => setConfirmPass(event.target.value)}/>
            <label>Confirm Pass</label>
            <button onClick={()=>handleSubmit()}>Create</button>
        </div>
    )

}