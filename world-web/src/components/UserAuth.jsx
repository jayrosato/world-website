import { useState, createContext, useContext, useEffect } from 'react';

const UserContext = createContext();

export function UserAuth({children}) {
    const[loggedIn, setLoggedIn] = useState()
    const[user, setUser] = useState(null);
    
    useEffect(() => {
        const fetchAuth= async () => {
            try{
                const response = await fetch(
                    'http://localhost:3000/session', 
                    {credentials:'include'}
                )
                if (response.status == 200){
                    const data= await response.json();
                    setLoggedIn(true);
                    setUser(data.user)
                }
                else{
                    setLoggedIn(false);
                    setUser(null)
                }
            }
            catch(err){
                console.log('Server Error, logging out...', err)
                setLoggedIn(false);
                setUser(null)
            }
        }
        fetchAuth();
    }, []
    );

    return (
        <UserContext.Provider value={{loggedIn, setLoggedIn, user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export function useAuth() {
    return useContext(UserContext)
}