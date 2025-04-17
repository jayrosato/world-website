import { useState } from "react";

export default function Login() {
    const[email, setEmail] = useState('')
    const[pass, setPass] = useState('')

    const handleSubmit=()=>{
        console.log(email, pass)
        const data={
            username: email,
            password: pass
        }
        fetch("http://localhost:3000/login/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data) 
            })
          }

    return(
        <div>
            <h1>Login</h1>
            <input type="text" value={email} onChange={(event) => setEmail(event.target.value)}/>
            <label for='email'>Email</label>
            <input type="password" value={pass} onChange={(event) => setPass(event.target.value)}/>
            <label for='password'>Pass</label>
            <button onClick={()=>handleSubmit()}>Login</button>
            <a href="/join"><button>Create Account</button></a>
        </div>
    )

}
