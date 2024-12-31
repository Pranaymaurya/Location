import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LocationModal from './components/Popup.jsx'
import { createBrowserRouter, createRoutesFromElements ,Route, RouterProvider} from 'react-router-dom'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import UserProfile from './components/userProfile.jsx'
import AddressManager from './components/Addaddress.jsx'

const router=createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<App/>}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register/>} />
    <Route path="location" element={<LocationModal />} />
    <Route path="user" element={<UserProfile />} />
    <Route path="address" element={<AddressManager />} />
    </Route>
))
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
