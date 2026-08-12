import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Shield, User as UserIcon } from 'lucide-react';

const Admin = () => {
    const { user, loading } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [activeTab, setActiveTab] = useState('members');
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

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
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
                            {exchanges.length === 0 ? <p>No exchanges recorded yet.</p> : exchanges.map(exchange => (
                                <div key={exchange._id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface-color)' }}>
                                    {exchange.itemId?.photoUrl && (
                                        <img src={exchange.itemId.photoUrl} alt="Item" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{exchange.itemId?.title || 'Unknown Item'}</h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <p style={{ margin: 0 }}><strong>Found/Lost By:</strong> {exchange.posterId?.name} ({exchange.posterId?.email})</p>
                                            <p style={{ margin: 0 }}><strong>Claimed By:</strong> {exchange.claimantId ? `${exchange.claimantId.name} (${exchange.claimantId.email})` : 'N/A'}</p>
                                            <p style={{ margin: 0 }}><strong>Returned On:</strong> {new Date(exchange.createdAt).toLocaleString()}</p>
                                        </div>
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
