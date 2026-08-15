import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
    ShieldAlert,
    Trash2,
    CheckCircle2,
    XCircle,
    UserCheck,
    UserX,
    Users,
    Package,
    AlertTriangle,
    Eye,
    RefreshCw,
    Repeat,
    FileText
} from 'lucide-react';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'items', 'users', 'claims'

    const [reports, setReports] = useState([]);
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [claims, setClaims] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAllAdminData();
        }
    }, [user]);

    const fetchAllAdminData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [repRes, itemRes, userRes, claimRes, exRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items?status=all`),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/claims/all`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges`, config)
            ]);

            setReports(repRes.data || []);
            setItems(itemRes.data || []);
            setUsers(userRes.data || []);
            setClaims(claimRes.data || []);
            setExchanges(exRes.data || []);
        } catch (error) {
            console.error('Error fetching admin hub data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showActionFeedback = (msg) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 3500);
    };

    // User Management Actions
    const handleToggleBlock = async (userId, currentBlocked) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}/block`,
                {},
                config
            );
            setUsers(users.map(u => u._id === userId ? { ...u, blocked: !currentBlocked } : u));
            showActionFeedback(`User ${currentBlocked ? 'unblocked' : 'blocked'} successfully`);
        } catch (error) {
            alert('Failed to update user block status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Permanently delete account for "${userName}"? This will delete all their items, claims, and messages.`)) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}`,
                config
            );
            setUsers(users.filter(u => u._id !== userId));
            setItems(items.filter(i => (i.postedBy?._id || i.postedBy) !== userId));
            setClaims(claims.filter(c => (c.claimantId?._id || c.claimantId) !== userId));
            setExchanges(exchanges.filter(ex => (ex.posterId?._id || ex.posterId) !== userId && (ex.claimantId?._id || ex.claimantId) !== userId));
            showActionFeedback(`Account for ${userName} deleted permanently`);
        } catch (error) {
            alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        }
    };

    // Report Actions
    const handleUpdateReport = async (reportId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/status`,
                { status },
                config
            );
            setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
            showActionFeedback(`Report marked as ${status}`);
        } catch (error) {
            alert('Failed to update report status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}`,
                config
            );
            setReports(reports.filter(r => r._id !== reportId));
            showActionFeedback('Report dismissed');
        } catch (error) {
            alert('Failed to delete report: ' + (error.response?.data?.message || error.message));
        }
    };

    // Item Actions
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this listing as admin?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${itemId}`,
                config
            );
            setItems(items.filter(i => i._id !== itemId));
            setReports(reports.filter(r => (r.itemId?._id || r.itemId) !== itemId));
            setClaims(claims.filter(c => (c.itemId?._id || c.itemId) !== itemId));
            setExchanges(exchanges.filter(e => (e.itemId?._id || e.itemId) !== itemId));
            showActionFeedback('Item deleted successfully');
        } catch (error) {
            alert('Failed to delete item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteExchange = async (exchangeId) => {
        if (!window.confirm('Delete this exchange log?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges/${exchangeId}`,
                config
            );
            setExchanges(exchanges.filter(e => e._id !== exchangeId));
            showActionFeedback('Exchange log deleted');
        } catch (error) {
            alert('Failed to delete exchange: ' + (error.response?.data?.message || error.message));
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
    const activeItemsCount = items.filter(i => i.status === 'active').length;
    const returnedItemsCount = items.filter(i => i.status === 'returned').length;
    const blockedUsersCount = users.filter(u => u.blocked).length;

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredItems = items.filter(i =>
        i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1200px' }}>
            {/* Admin Header */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.9rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <ShieldAlert size={28} color="var(--danger)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            Campus Administration Center
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Platform oversight, spam moderation, user account control, and exchange management
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button onClick={fetchAllAdminData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <RefreshCw size={15} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Action Feedback Banner */}
            {actionMsg && (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <CheckCircle2 size={18} /> {actionMsg}
                </div>
            )}

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`filter-pill ${activeTab === 'overview' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <Package size={15} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`filter-pill ${activeTab === 'reports' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <AlertTriangle size={15} color="var(--danger)" /> Reported Abuse ({pendingReportsCount})
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`filter-pill ${activeTab === 'items' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <Package size={15} /> Item Listings ({items.length})
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`filter-pill ${activeTab === 'users' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <Users size={15} /> Users & Accounts ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('claims')}
                    className={`filter-pill ${activeTab === 'claims' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <Repeat size={15} /> Claims & Exchanges ({exchanges.length})
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    Loading administrative metrics...
                </div>
            ) : (
                <>
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* Stat Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Listings</span>
                                    <h3 style={{ fontSize: '2rem', margin: '0.4rem 0 0 0', color: 'var(--accent-primary)' }}>{activeItemsCount}</h3>
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items Returned</span>
                                    <h3 style={{ fontSize: '2rem', margin: '0.4rem 0 0 0', color: 'var(--success)' }}>{returnedItemsCount}</h3>
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Reports</span>
                                    <h3 style={{ fontSize: '2rem', margin: '0.4rem 0 0 0', color: pendingReportsCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{pendingReportsCount}</h3>
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Students</span>
                                    <h3 style={{ fontSize: '2rem', margin: '0.4rem 0 0 0', color: 'var(--text-color)' }}>{users.length}</h3>
                                </div>
                            </div>

                            {/* Two-Column Quick Panel */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                {/* Recent Pending Reports Widget */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertTriangle size={18} color="var(--danger)" /> Abuse Alerts Needing Review
                                        </h3>
                                        <button onClick={() => setActiveTab('reports')} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                                            View All
                                        </button>
                                    </div>

                                    {reports.filter(r => r.status === 'pending').length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending abuse reports. Good job!</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {reports.filter(r => r.status === 'pending').slice(0, 4).map(report => (
                                                <div key={report._id} style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong style={{ fontSize: '0.9rem' }}>{report.itemId?.title || 'Reported Post'}</strong>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            Reason: {report.reason}
                                                        </p>
                                                    </div>
                                                    <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Exchanges Widget */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle2 size={18} color="var(--success)" /> Recent Returned Items
                                        </h3>
                                        <button onClick={() => setActiveTab('claims')} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                                            View All
                                        </button>
                                    </div>

                                    {exchanges.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No returned item exchanges recorded yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {exchanges.slice(0, 4).map(exchange => (
                                                <div key={exchange._id} style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong style={{ fontSize: '0.9rem' }}>{exchange.itemId?.title || 'Returned Item'}</strong>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            Returned by: {exchange.posterId?.name || 'Student'}
                                                        </p>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {new Date(exchange.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: REPORTED ABUSE */}
                    {activeTab === 'reports' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={20} color="var(--danger)" /> Abuse & Policy Violation Reports ({reports.length})
                            </h3>

                            {reports.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No reports submitted.
                                </div>
                            ) : (
                                reports.map(report => (
                                    <div key={report._id} className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: `4px solid ${report.status === 'pending' ? 'var(--danger)' : 'var(--success)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                    <span className="badge" style={{ background: report.status === 'pending' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: report.status === 'pending' ? 'var(--danger)' : 'var(--success)' }}>
                                                        STATUS: {report.status.toUpperCase()}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        Reported on: {new Date(report.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>
                                                    Reason: <span style={{ color: 'var(--danger)' }}>{report.reason}</span>
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    Reported By: <strong>{report.reportedBy?.name || 'Anonymous'}</strong> ({report.reportedBy?.email})
                                                </p>
                                            </div>

                                            {/* Report Action Buttons */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {report.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => handleUpdateReport(report._id, 'reviewed')} className="btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', background: 'var(--success)' }}>
                                                            <CheckCircle2 size={14} /> Mark Resolved
                                                        </button>
                                                        <button onClick={() => handleUpdateReport(report._id, 'dismissed')} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}>
                                                            <XCircle size={14} /> Dismiss
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleDeleteReport(report._id)} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
                                                        <Trash2 size={14} /> Delete Log
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Target Item Summary */}
                                        {report.itemId ? (
                                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {report.itemId.photoUrl && (
                                                        <img src={report.itemId.photoUrl} alt="Reported Item" style={{ width: '54px', height: '54px', borderRadius: '6px', objectFit: 'cover' }} />
                                                    )}
                                                    <div>
                                                        <strong style={{ fontSize: '1rem' }}>{report.itemId.title}</strong>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            Posted by: {report.itemId.postedBy?.name || 'Unknown'} ({report.itemId.postedBy?.email}) • Category: {report.itemId.category}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Link to={`/item/${report.itemId._id}`} target="_blank" className="btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Eye size={14} /> View Item
                                                    </Link>
                                                    <button onClick={() => handleDeleteItem(report.itemId._id)} className="btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
                                                        <Trash2 size={14} /> Delete Item
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                Target item has already been deleted from the database.
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB: ITEM LISTINGS */}
                    {activeTab === 'items' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Campus Item Catalog ({items.length})</h3>
                                <input
                                    type="text"
                                    placeholder="Filter by title, category, or location..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '320px', padding: '0.6rem 1rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                                {filteredItems.map(item => (
                                    <div key={item._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {item.photoUrl && (
                                            <img src={item.photoUrl} alt={item.title} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>
                                                <Link to={`/item/${item._id}`} style={{ color: 'var(--text-color)' }}>{item.title}</Link>
                                            </h4>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                                <span className={`badge badge-${item.type}`}>{item.type}</span>
                                                <span className="badge" style={{ background: 'var(--bg-secondary)' }}>{item.status}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                By: {item.postedBy?.name || 'User'} • {item.location}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="btn-secondary"
                                            style={{ color: 'var(--danger)', padding: '0.5rem' }}
                                            title="Delete Listing"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: USERS & ACCOUNTS */}
                    {activeTab === 'users' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Registered Students & Administrators</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {users.length} registered accounts ({blockedUsersCount} blocked)
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by student name or college email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '320px', padding: '0.6rem 1rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filteredUsers.map(u => (
                                    <div
                                        key={u._id}
                                        className="glass-card animate-fade-in"
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderLeft: u.blocked ? '4px solid var(--danger)' : u.role === 'admin' ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: u.blocked ? 'var(--danger)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                                {u.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <strong style={{ fontSize: '1.05rem' }}>{u.name}</strong>
                                                    <span className="badge" style={{ background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                    {u.blocked && (
                                                        <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
                                                            BLOCKED
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    Email: {u.email} • Joined: {new Date(u.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {u._id !== user._id && (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleToggleBlock(u._id, u.blocked)}
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '0.5rem 0.85rem',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem',
                                                        color: u.blocked ? 'var(--success)' : 'var(--danger)',
                                                        borderColor: u.blocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                                                    }}
                                                >
                                                    {u.blocked ? <UserCheck size={14} /> : <UserX size={14} />}
                                                    {u.blocked ? 'Unblock User' : 'Block User'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '0.5rem 0.85rem',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem',
                                                        color: 'var(--danger)'
                                                    }}
                                                    title="Permanently delete user and data"
                                                >
                                                    <Trash2 size={14} /> Delete Account
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: CLAIMS & EXCHANGES */}
                    {activeTab === 'claims' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Exchange History Section */}
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                                    <Repeat size={20} color="var(--success)" /> Completed Campus Exchanges ({exchanges.length})
                                </h3>

                                {exchanges.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No completed exchanges yet.</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
                                        {exchanges.map(ex => (
                                            <div key={ex._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {ex.itemId?.photoUrl && (
                                                    <img src={ex.itemId.photoUrl} alt="Item" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>{ex.itemId?.title || 'Returned Item'}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        Poster: {ex.posterId?.name} | Claimant: {ex.claimantId?.name || 'Direct Return'}
                                                    </p>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Date: {new Date(ex.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteExchange(ex._id)}
                                                    className="btn-secondary"
                                                    style={{ color: 'var(--danger)', padding: '0.5rem' }}
                                                    title="Delete Exchange Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* All Claims Section */}
                            <div style={{ marginTop: '1rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                                    <FileText size={20} color="var(--accent-primary)" /> All Campus Claims & Match Requests ({claims.length})
                                </h3>

                                {claims.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No claims recorded.</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                                        {claims.map(claim => (
                                            <div key={claim._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <strong style={{ fontSize: '0.95rem' }}>{claim.itemId?.title || 'Unknown Item'}</strong>
                                                    <span className="badge" style={{ background: claim.status === 'approved' ? 'rgba(34,197,94,0.15)' : claim.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', color: claim.status === 'approved' ? 'var(--success)' : claim.status === 'rejected' ? 'var(--danger)' : 'var(--accent-primary)' }}>
                                                        {claim.status}
                                                    </span>
                                                </div>
                                                {claim.dropLocation && (
                                                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                                        <strong>Location:</strong> {claim.dropLocation}
                                                    </p>
                                                )}
                                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                    "{claim.message}"
                                                </p>
                                                {claim.photoUrl && (
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <a href={claim.photoUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={claim.photoUrl} alt="Finder proof" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                                                        </a>
                                                    </div>
                                                )}
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    By: {claim.claimantId?.name} ({claim.claimantId?.email}) • {new Date(claim.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;
