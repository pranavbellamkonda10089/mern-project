import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, googleLogin, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');

    if (user) return <Navigate to="/dashboard" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        let res;
        if (isLogin) {
            res = await login(formData.email, formData.password);
        } else {
            res = await register(formData.name, formData.email, formData.password, formData.role);
        }
        if (!res.success) {
            setError(res.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        const res = await googleLogin(credentialResponse.credential);
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Join CampusCrate'}
                </h2>
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-color)', marginTop: '0.25rem' }}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>College Email</label>
                        <input type="email" placeholder="student@college.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    </div>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign In was unsuccessful')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
