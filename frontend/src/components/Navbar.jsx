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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-color)', padding: '0.35rem 0.35rem 0.35rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ background: 'var(--bg-color)', padding: '0.25rem', borderRadius: '50%', display: 'flex' }}>
                                    <User size={16} className="text-secondary" />
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name}
                                </span>
                            </div>
                            <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }} title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="btn-primary">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
