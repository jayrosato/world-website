import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import { UserAuth } from './components/UserAuth'

import routes from './routes/routes';
import './styles/index.css'

const router = createBrowserRouter(routes)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserAuth>
      <RouterProvider router = {router} />
    </UserAuth>
  </StrictMode>,
)
