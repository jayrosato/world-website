import Home from '../components/App';
import Faiths from '../components/faiths';
import Login from '../components/Login';
import Join from '../components/Join'
import Logout from '../components/Logout';

const routes = [
    {
        path: '/',
        element: <Home />,
    },
    {
        path: "/faiths",
        element:    <Faiths />,
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/join',
        element: <Join />
    },
    {
        path: '/logout',
        element: <Logout />
    },
];

export default routes