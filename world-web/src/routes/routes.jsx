import Home from '../components/App';
import Faiths from '../components/faiths';
import Login from '../components/Login';
import Join from '../components/Join'
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

];

export default routes