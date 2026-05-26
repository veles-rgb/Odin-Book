import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

// Pages and Components
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
