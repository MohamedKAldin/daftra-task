import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext.jsx';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let authButtons = null;

  if (user) {
    authButtons = (
      <>
        <span className="me-3">{user.name || user.email}</span>
        <Link to="/cart" className="btn btn-outline-primary me-3">
          Cart
        </Link>
        <button onClick={handleLogout} className="btn btn-outline-danger me-3">
          Logout
        </button>
      </>
    );
  } else {
    authButtons = (
      <button
        onClick={() => navigate('/login')}
        className="btn btn-outline-primary"
      >
        Login
      </button>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="logo" className="me-2" width={120} />
        </Link>

        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link to="/products" className="nav-link">
              <b>
                Products
              </b>
            </Link>
          </li>
        </ul>

        <div className="d-flex align-items-center">
          {authButtons}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
