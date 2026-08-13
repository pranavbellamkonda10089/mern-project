import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Shield, User as UserIcon, Trash2 } from 'lucide-react';

const Admin = () => {
    const { user, loading } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [activeTab, setActiveTab] = useState('members');
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    const handleDeleteExchange = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exchange record?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setExchanges(exchanges.filter(ex => ex._id !== id));
        } catch (err) {
            console.error('Delete exchange error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to delete exchange: ${errorMsg}`);
        }
    };

    useEffect(() => {
        const fetchMembers = async () => {
            if (user && user.role === 'admin') {
                try {
                    const [membersRes, exchangesRes] = await Promise.all([
                        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`, { headers: { Authorization: `Bearer ${user.token}` } }),
                        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges`, { headers: { Authorization: `Bearer ${user.token}` } })
                    ]);
                    setMembers(membersRes.data);
                    setExchanges(exchangesRes.data);
                } catch (err) {
                    setError('Failed to fetch data. Ensure backend is running.');
                } finally {
                    setFetching(false);
                }
            } else {
                setFetching(false);
            }
        };

        fetchMembers();
    }, [user]);

    if (loading) return <div className="page-container"><p>Loading...</p></div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="page-container">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield className="text-secondary" />
                Admin Dashboard
            </h1>
            <p className="page-subtitle">Manage all registered members in CampusCrate.</p>

            {fetching ? (
                <p>Loading data...</p>
            ) : error ? (
                <div style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}>Members</button>
                        <button onClick={() => setActiveTab('exchanges')} className={activeTab === 'exchanges' ? 'btn-primary' : 'btn-secondary'}>Exchanges History</button>
                    </div>

                    {activeTab === 'members' ? (
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {members.map(member => (
                                <div key={member._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                                            <UserIcon size={20} className="text-secondary" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{member.name}</h3>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{member.role === 'admin' ? 'Admin' : 'Student'}</p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                                            <span>{member.email}</span>
                                        </p>
                                        <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Joined:</span>
                                            <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                                        </p>
                                        <p style={{ margin: '0', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                            <span style={{ color: member.blocked ? 'var(--red)' : 'var(--green)' }}>
                                                {member.blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                            {exchanges.length === 0 ? <p>No exchanges recorded yet.</p> : exchanges.map(exchange => (
                                <div key={exchange._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-color)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {exchange.itemId?.photoUrl && (
                                            <img src={exchange.itemId.photoUrl} alt="Item" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>{exchange.itemId?.title || 'Unknown Item'}</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Returned On: {new Date(exchange.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteExchange(exchange._id)}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', cursor: 'pointer', padding: '0.6rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                            title="Delete Exchange"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <p style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Found/Lost By</span>
                                            <strong style={{ color: 'var(--text-color)' }}>{exchange.posterId?.name} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>({exchange.posterId?.email})</span></strong>
                                        </p>
                                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }}></div>
                                        <p style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Claimed By</span>
                                            <strong style={{ color: 'var(--text-color)' }}>{exchange.claimantId ? <>{exchange.claimantId.name} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>({exchange.claimantId.email})</span></> : 'N/A'}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;
