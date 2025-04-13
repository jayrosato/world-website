import Home from '../components/App';
import Faiths from '../components/faiths';

const routes = [
    {
        path: '/',
        element: <Home />,
    },
    {
        path: "/faiths",
        element:    <Faiths />,
    },

];

export default routes