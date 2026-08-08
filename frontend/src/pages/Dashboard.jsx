import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (user) {
            fetchMyItems();
        }
    }, [user]);

    const fetchMyItems = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items`);
            const myItems = data.filter(item => typeof item.postedBy === 'object'
                ? item.postedBy._id === user._id
                : item.postedBy === user._id || (item.postedBy.email === user.email)
            );
            setItems(myItems);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsReturned = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/status`, { status: 'returned' }, config);
            fetchMyItems();
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>My Dashboard</h2>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>My Posted Items</h3>

                {items.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't posted any items yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: 'var(--border-radius-sm)' }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.25rem' }}>
                                        <Link to={`/item/${item._id}`} style={{ color: 'var(--accent-primary)' }}>{item.title}</Link>
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                                        <span>Status: <strong style={{ color: item.status === 'returned' ? 'var(--success)' : 'inherit' }}>{item.status}</strong></span>
                                        <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {item.status !== 'returned' && (
                                    <button onClick={() => markAsReturned(item._id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                        Mark as Returned
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
