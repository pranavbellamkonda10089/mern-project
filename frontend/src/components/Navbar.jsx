import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="nav-profile-btn"
                                title="Open Profile Menu"
                                aria-label="Profile"
                            >
                                <User size={18} />
                            </button>
                            {dropdownOpen && (
                                <div className="nav-dropdown animate-fade-in">
                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{user.name}</span>
                                            <span className="badge" style={{ fontSize: '0.65rem', background: user.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)', color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                                {user.role?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                                            {user.email}
                                        </div>
                                    </div>

                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.75rem -1.25rem' }}></div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                        <Link
                                            to="/dashboard"
                                            className="nav-dropdown-link"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={16} /> My Dashboard
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="nav-dropdown-link"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Shield size={16} /> Admin Panel
                                            </Link>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            logout();
                                        }}
                                        className="btn-secondary"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.12)',
                                            color: 'var(--danger)',
                                            borderColor: 'rgba(239, 68, 68, 0.3)',
                                            padding: '0.55rem',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <LogOut size={15} /> Logout
                                    </button>
                                </div>
                            )}
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
