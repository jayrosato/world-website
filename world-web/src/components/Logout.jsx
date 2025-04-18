import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './UserAuth'

export default function Logout() {
    const {user, setLoggedIn, setUser} = useAuth();
    const navigate = useNavigate();

    const getLogoutResponse = async () => {
        try {
            const response = await fetch("http://localhost:3000/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            //body: JSON.stringify({user: user })
            });
            if (response.status === 200) {
                setLoggedIn(false);
                setUser(null)
                navigate('/');
            } 
        } 
        catch (err) {
            console.error('Network or server error', err);
        }
    };
    getLogoutResponse()
    return(<p>Logging you out now...</p>)
}