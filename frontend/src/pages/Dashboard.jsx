import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    PlusCircle,
    CheckCircle,
    Trash2,
    QrCode,
    ExternalLink,
    Package
} from 'lucide-react';

const Dashboard = ({ filterType }) => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyItems();
        }
    }, [user, filterType]);

    const fetchMyItems = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items?status=all`);
            let myItems = data.filter(item => {
                const postedById = typeof item.postedBy === 'object' ? item.postedBy?._id : item.postedBy;
                const postedByEmail = typeof item.postedBy === 'object' ? item.postedBy?.email : null;
                return postedById === user._id || (postedByEmail && postedByEmail === user.email);
            });

            if (filterType === 'lost') {
                myItems = myItems.filter(item => item.type === 'lost');
            } else if (filterType === 'found') {
                myItems = myItems.filter(item => item.type === 'found');
            }

            setItems(myItems);
        } catch (error) {
            console.error('Error fetching dashboard items:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsReturned = async (id) => {
        if (!window.confirm('Mark this item as returned? This will close active claims and update the status.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/status`, { status: 'returned' }, config);
            fetchMyItems();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteMyItem = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}`, config);
            fetchMyItems();
        } catch (error) {
            alert('Failed to delete item: ' + (error.response?.data?.message || error.message));
        }
    };

    if (!user) return <Navigate to="/login" />;

    const returnedCount = items.filter(i => i.status === 'returned').length;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1050px' }}>
            {/* User Profile Overview */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {user.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{user.name}</h2>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                                {user.role?.toUpperCase()}
                            </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {user.email}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{items.length}</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Posted Items</p>
                    </div>
                    <div style={{ width: '1px', height: '35px', background: 'var(--border-color)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{returnedCount}</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Returned</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/dashboard" className={`filter-pill ${!filterType ? 'active' : ''}`}>All Posted ({items.length})</Link>
                    <Link to="/dashboard/lost" className={`filter-pill ${filterType === 'lost' ? 'active' : ''}`}>My Lost Items</Link>
                    <Link to="/dashboard/found" className={`filter-pill ${filterType === 'found' ? 'active' : ''}`}>My Found Items</Link>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/post-lost" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}>
                        <PlusCircle size={16} color="var(--danger)" /> Post Lost
                    </Link>
                    <Link to="/post-found" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}>
                        <PlusCircle size={16} /> Post Found
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontSize: '1.3rem' }}>
                    {filterType === 'lost' ? 'My Reported Lost Items' : filterType === 'found' ? 'My Reported Found Items' : 'All My Campus Listings'}
                </h3>

                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading your items...</p>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Package size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No items posted here yet</h4>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                            Report items you've misplaced or found on campus to help yourself and your peers recover belongings.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/post-lost" className="btn-secondary">I Lost Something</Link>
                            <Link to="/post-found" className="btn-primary">I Found Something</Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map(item => (
                            <div
                                key={item._id}
                                className="animate-fade-in"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'var(--bg-secondary)',
                                    padding: '1.25rem 1.5rem',
                                    borderRadius: 'var(--border-radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                    {item.photoUrl && (
                                        <img
                                            src={item.photoUrl}
                                            alt={item.title}
                                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                        />
                                    )}
                                    <div>
                                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem' }}>
                                            <Link to={`/item/${item._id}`} style={{ color: 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                {item.title} <ExternalLink size={14} color="var(--accent-primary)" />
                                            </Link>
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span className={`badge badge-${item.type}`}>{item.type}</span>
                                            <span style={{ textTransform: 'capitalize' }}>Category: {item.category?.replace('_', ' ')}</span>
                                            <span>•</span>
                                            <span>Location: {item.location}</span>
                                            <span>•</span>
                                            <span>Date: {new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span style={{ fontWeight: 'bold', color: item.status === 'returned' ? 'var(--success)' : item.status === 'claimed' ? 'var(--warning)' : 'var(--accent-primary)' }}>
                                                Status: {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Link
                                        to={`/item/${item._id}`}
                                        className="btn-secondary"
                                        style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        title="View QR Tag & Claims"
                                    >
                                        <QrCode size={14} /> View / QR Tag
                                    </Link>

                                    {item.status !== 'returned' && (
                                        <button
                                            onClick={() => markAsReturned(item._id)}
                                            className="btn-primary"
                                            style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                            <CheckCircle size={14} /> Mark Returned
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteMyItem(item._id)}
                                        className="btn-secondary"
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                                        title="Delete Listing"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
