import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

// Pages and Components
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Post from './pages/Post';
import Profile from './pages/Profile';
import UserIndex from './pages/userIndex';

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/register"
            element={user ? <Navigate to={'/'} /> : <Register />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to={'/'} /> : <Login />}
          />

          {/* AUTH ROUTES */}
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to={'/login'} />}
          />
          <Route
            path="/post/:postId"
            element={user ? <Post /> : <Navigate to={'/login'} />}
          />
          <Route
            path="/profile/:identifier"
            element={user ? <Profile /> : <Navigate to={'/login'} />}
          />

          <Route
            path="/search"
            element={user ? <UserIndex /> : <Navigate to={'/login'} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
