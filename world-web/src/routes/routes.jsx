import Home from '../components/App';
import Faiths from '../components/faiths';
import Login from '../components/Login';
import Join from '../components/Join'
import Logout from '../components/Logout';
import Forum from '../components/Forum';
import Profile from '../components/Profile';
import RedirectIfAuthenticated from '../components/RedirectIfAuth';
import RedirectIfNotAuthenticated from '../components/RedirectIfNotAuth';
const routes = [
    {
        path: '/',
        element: <Home />,
    },
    {
        path: "/faiths",
        element: <Faiths />,
    },
    {
        
        path: '/login',
        element:(
            <RedirectIfAuthenticated>
                <Login />
            </RedirectIfAuthenticated>
        )
    },

    {
        path: '/join',
        element: (
            <RedirectIfAuthenticated>
                <Join />
            </RedirectIfAuthenticated>
        ) 
    },
    {
        path: '/logout',
        element: (
            <Logout />
        )
    },
    {
        path: '/profile',
        element: (
            <RedirectIfNotAuthenticated>
                <Profile />
            </RedirectIfNotAuthenticated>
        )
    },
    {
        path: '/forum',
        element: <Forum />
    },
];

export default routes