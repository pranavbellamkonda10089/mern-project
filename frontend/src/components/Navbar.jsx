import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LogOut, User, LayoutDashboard, Shield, QrCode, X, Search, ArrowRight } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLookupModal, setShowLookupModal] = useState(false);
    const [lookupInput, setLookupInput] = useState('');
    const [lookupError, setLookupError] = useState('');
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

    const handleLookupSubmit = (e) => {
        e.preventDefault();
        setLookupError('');
        const val = lookupInput.trim();
        if (!val) return;

        // Check if full URL or path
        let targetId = val;
        if (val.includes('/item/')) {
            const parts = val.split('/item/');
            targetId = parts[1].split('?')[0].split('#')[0].replace(/\/+$/, '');
        }

        if (targetId) {
            setShowLookupModal(false);
            setLookupInput('');
            navigate(`/item/${targetId}`);
        } else {
            setLookupError('Invalid QR code URL or Tag ID format.');
        }
    };

    return (
        <>
            <nav className="nav">
                <Link to="/" className="nav-logo flex items-center gap-2">
                    <Box className="gradient-text" />
                    <span>Campus<span className="gradient-text">Crate</span></span>
                </Link>
                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" className="nav-link">Home</Link>
                    
                    <button
                        onClick={() => setShowLookupModal(true)}
                        className="nav-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '20px',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                        title="Lookup scanned QR tag"
                    >
                        <QrCode size={15} /> Tag Lookup
                    </button>

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

            {/* QR Tag Lookup Modal */}
            {showLookupModal && (
                <div className="modal-backdrop" onClick={() => setShowLookupModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <QrCode size={20} color="var(--accent-primary)" /> QR Tag / Item Lookup
                            </h3>
                            <button onClick={() => setShowLookupModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                            Found an item with a CampusCrate QR tag? Paste the scanned QR link or enter the Item ID to report finding it or view ownership details.
                        </p>

                        {lookupError && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                {lookupError}
                            </div>
                        )}

                        <form onSubmit={handleLookupSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>Scanned QR Code URL or Item ID</label>
                                <input
                                    type="text"
                                    placeholder="Paste http://.../item/xyz or enter item ID"
                                    value={lookupInput}
                                    onChange={e => setLookupInput(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                    Open Item Page <ArrowRight size={16} />
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowLookupModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
