import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Post from './pages/Post';
import Profile from './pages/Profile';
import UserIndex from './pages/userIndex';
import Feed from './pages/Feed';
import Footer from './components/Footer';

function App() {
  const { user } = useAuthContext();

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />

        <main className="appMain">
          <Routes>
            <Route
              path="/register"
              element={user ? <Navigate to="/" /> : <Register />}
            />

            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />

            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />

            <Route
              path="/post/:postId"
              element={user ? <Post /> : <Navigate to="/login" />}
            />

            <Route
              path="/profile/:identifier"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />

            <Route
              path="/search"
              element={user ? <UserIndex /> : <Navigate to="/login" />}
            />

            <Route
              path="/feed"
              element={user ? <Feed /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
