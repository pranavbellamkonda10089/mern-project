import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="nav">
            <Link to="/" className="nav-logo flex items-center gap-2">
                <Box className="gradient-text" />
                <span>Campus<span className="gradient-text">Crate</span></span>
            </Link>
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-link">Admin Panel</Link>
                        )}
                        <button onClick={logout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn-primary">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
