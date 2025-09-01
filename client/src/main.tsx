import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// Styles (Vite will bundle these correctly)
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles.css'
import App from './modules/App'
import Dashboard from './modules/dashboard/Dashboard'
import RookiesList from './modules/rookies/RookiesList'
import RookieEditor from './modules/rookies/RookieEditor'
import RookieDetail from './modules/rookies/RookieDetail'
import Templates from './modules/templates/Templates'
import TemplateEditor from './modules/templates/TemplateEditor'
import Binder from './modules/binder/Binder'
import Settings from './modules/settings/Settings'
import Browns from './modules/browns/Browns'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
  { path: 'rookies', element: <RookiesList /> },
  { path: 'rookies/new', element: <RookieEditor /> },
  { path: 'rookies/:id/edit', element: <RookieEditor /> },
      { path: 'rookies/:id', element: <RookieDetail /> },
  { path: 'templates', element: <Templates /> },
  { path: 'templates/new', element: <TemplateEditor /> },
  { path: 'templates/:id/edit', element: <TemplateEditor /> },
  { path: 'browns', element: <Browns /> },
      { path: 'binder', element: <Binder /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
