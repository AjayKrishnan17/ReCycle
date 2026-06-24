import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-dot" />
        CampusCycle
      </Link>
      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/my-orders" className="btn">My orders</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="btn">Admin</Link>
            )}
            <button className="btn" onClick={() => { logout(); navigate('/'); }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Log in</Link>
            <Link to="/register" className="btn btn-primary">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}