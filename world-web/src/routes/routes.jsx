import Home from '../components/App';
import Faiths from '../components/faiths';
import Login from '../components/Login';
import Join from '../components/Join'
import Logout from '../components/Logout';
import Profile from '../components/Profile';
import PostDetail from '../components/PostDetail';
import Forum from '../components/Forum';
import CreatePost from '../components/CreatePost';

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
            //<RedirectIfNotAuthenticated>
                <Profile />
            //</RedirectIfNotAuthenticated>
        )
    },
    {
        path: '/forum',
        element: <Forum />
    },
    {
        path: '/forum/:postId',
        element: <PostDetail />
    },
    {
        path: '/forum/create',
        element: <CreatePost />
    },
];

export default routes