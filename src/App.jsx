import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import About from './pages/About'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import Waiting from './pages/Waiting'
import ChatRoom from './pages/ChatRoom'

// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const token = localStorage.getItem('sharehub_token')
    const userData = localStorage.getItem('sharehub_user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])
  
  const login = (userData, token) => {
    localStorage.setItem('sharehub_token', token)
    localStorage.setItem('sharehub_user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('sharehub_token')
    localStorage.removeItem('sharehub_user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login onLogin={login} />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/" /> : <Signup onLogin={login} />
        } />
        <Route path="/" element={
          isAuthenticated ? <Landing user={user} onLogout={logout} /> : <Navigate to="/login" />
        } />
        <Route path="/create" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <CreateRoom />
          </ProtectedRoute>
        } />
        <Route path="/join" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <JoinRoom />
          </ProtectedRoute>
        } />
        <Route path="/waiting" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Waiting />
          </ProtectedRoute>
        } />
        <Route path="/room/:roomCode" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ChatRoom />
          </ProtectedRoute>
        } />
        <Route path="/features" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Features />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Pricing />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <About />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
