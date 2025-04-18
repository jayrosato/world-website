import { useState, createContext, useContext } from 'react';

const UserContext = createContext();

export function UserAuth({children}) {
    const[loggedIn, setLoggedIn] = useState(false)
    const[user, setUser] = useState(null);
    
    return (
        <UserContext.Provider value={{loggedIn, setLoggedIn, user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export function useAuth() {
    return useContext(UserContext)
}