import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LogOut, User } from 'lucide-react';

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
                                style={{ background: 'var(--surface-color)', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-color)' }}
                                title="Open Profile Menu"
                            >
                                <User size={20} />
                            </button>
                            {dropdownOpen && (
                                <div className="card animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: '0', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '1rem', minWidth: '200px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 100 }}>
                                    <div style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
                                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all' }}>{user.email}</div>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem -1rem' }}></div>
                                    <button
                                        onClick={logout}
                                        className="btn-secondary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                                    >
                                        <LogOut size={16} /> Logout
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
