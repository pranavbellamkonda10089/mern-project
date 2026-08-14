import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
    Shield,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Trash2,
    Lock,
    Unlock,
    ExternalLink,
    Search,
    Repeat
} from 'lucide-react';

const Admin = () => {
    const { user, loading } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('overview');
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    // State data
    const [members, setMembers] = useState([]);
    const [reports, setReports] = useState([]);
    const [items, setItems] = useState([]);
    const [claims, setClaims] = useState([]);
    const [exchanges, setExchanges] = useState([]);

    // Filters
    const [memberSearch, setMemberSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [reportFilter, setReportFilter] = useState('all');

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAllAdminData();
        } else {
            setFetching(false);
        }
    }, [user]);

    const fetchAllAdminData = async () => {
        setFetching(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [membersRes, reportsRes, itemsRes, claimsRes, exchangesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items?status=all`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/claims/all`, config),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges`, config)
            ]);

            setMembers(membersRes.data || []);
            setReports(reportsRes.data || []);
            setItems(itemsRes.data || []);
            setClaims(claimsRes.data || []);
            setExchanges(exchangesRes.data || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
            setError('Failed to fetch admin data. Ensure backend is running.');
        } finally {
            setFetching(false);
        }
    };

    // User Moderation: Block / Unblock
    const handleToggleBlockUser = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}/block`,
                {},
                config
            );
            setMembers(members.map(m => m._id === userId ? data.user : m));
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating user block status');
        }
    };

    // Report Moderation
    const handleUpdateReportStatus = async (reportId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/status`,
                { status: newStatus },
                config
            );
            setReports(reports.map(r => r._id === reportId ? { ...r, status: data.status } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating report status');
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm('Dismiss and delete this abuse report?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}`, config);
            setReports(reports.filter(r => r._id !== reportId));
        } catch {
            alert('Error deleting report');
        }
    };

    // Item Moderation: Delete Item
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to permanently delete this item and its associated data?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${itemId}`, config);
            setItems(items.filter(item => item._id !== itemId));
            setReports(reports.filter(r => (r.itemId?._id || r.itemId) !== itemId));
            setClaims(claims.filter(c => (c.itemId?._id || c.itemId) !== itemId));
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting item');
        }
    };

    // Exchange Deletion
    const handleDeleteExchange = async (exchangeId) => {
        if (!window.confirm('Delete this exchange record permanently?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/exchanges/${exchangeId}`, config);
            setExchanges(exchanges.filter(ex => ex._id !== exchangeId));
        } catch {
            alert('Error deleting exchange');
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>Loading...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
    const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;
    const blockedUsersCount = members.filter(m => m.blocked).length;

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.location.toLowerCase().includes(itemSearch.toLowerCase()) ||
        (item.postedBy?.name && item.postedBy.name.toLowerCase().includes(itemSearch.toLowerCase()))
    );

    const filteredReports = reports.filter(r => {
        if (reportFilter === 'all') return true;
        return r.status === reportFilter;
    });

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.2rem', margin: '0 0 0.25rem 0' }}>
                        <Shield color="var(--accent-primary)" /> CampusCrate Admin Moderation
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Review reported abuse, moderate campus posts, manage claims & prevent spam.
                    </p>
                </div>

                <button onClick={fetchAllAdminData} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    ↻ Refresh Data
                </button>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Members</span>
                    <h2 style={{ fontSize: '1.9rem', margin: '0.4rem 0 0 0' }}>{members.length}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{blockedUsersCount} Blocked</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Items</span>
                    <h2 style={{ fontSize: '1.9rem', margin: '0.4rem 0 0 0' }}>{items.filter(i => i.status === 'active').length}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{items.length} Total Posts</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Abuse Reports</span>
                    <h2 style={{ fontSize: '1.9rem', margin: '0.4rem 0 0 0', color: pendingReportsCount > 0 ? 'var(--danger)' : 'inherit' }}>
                        {pendingReportsCount}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reports.length} Total Reports</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending Claims</span>
                    <h2 style={{ fontSize: '1.9rem', margin: '0.4rem 0 0 0' }}>{pendingClaimsCount}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{claims.length} Total Claims</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Exchanges</span>
                    <h2 style={{ fontSize: '1.9rem', margin: '0.4rem 0 0 0', color: 'var(--success)' }}>{exchanges.length}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items Returned</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`filter-pill ${activeTab === 'overview' ? 'active' : ''}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`filter-pill ${activeTab === 'reports' ? 'active' : ''}`}
                    style={{ position: 'relative' }}
                >
                    Reported Abuse {pendingReportsCount > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '0.7rem', marginLeft: '0.3rem' }}>{pendingReportsCount}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`filter-pill ${activeTab === 'items' ? 'active' : ''}`}
                >
                    All Item Listings & Spam
                </button>
                <button
                    onClick={() => setActiveTab('members')}
                    className={`filter-pill ${activeTab === 'members' ? 'active' : ''}`}
                >
                    Student Members ({members.length})
                </button>
                <button
                    onClick={() => setActiveTab('claims')}
                    className={`filter-pill ${activeTab === 'claims' ? 'active' : ''}`}
                >
                    Claims & Exchanges
                </button>
            </div>

            {fetching ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading data...</div>
            ) : (
                <>
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Urgent Action Needed Banner */}
                            {pendingReportsCount > 0 && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <AlertTriangle size={28} color="var(--danger)" />
                                        <div>
                                            <strong style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>
                                                {pendingReportsCount} Abuse / Spam Report(s) require your review
                                            </strong>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Students have flagged potential fake posts, duplicates, or spam items.
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('reports')} className="btn-primary" style={{ background: 'var(--danger)', padding: '0.6rem 1.25rem' }}>
                                        Review Reports Now
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                                {/* Recent Reports Widget */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertTriangle size={18} color="var(--danger)" /> Recent Abuse Reports
                                        </h3>
                                        <button onClick={() => setActiveTab('reports')} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                                            View All
                                        </button>
                                    </div>

                                    {reports.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No abuse reports filed. The campus feed is healthy!</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {reports.slice(0, 4).map(report => (
                                                <div key={report._id} style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong style={{ fontSize: '0.9rem' }}>{report.itemId?.title || 'Unknown Item'}</strong>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            Reason: {report.reason}
                                                        </p>
                                                    </div>
                                                    <span className="badge" style={{ background: report.status === 'pending' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: report.status === 'pending' ? 'var(--danger)' : 'var(--success)' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setReportFilter('all')} className={`filter-pill ${reportFilter === 'all' ? 'active' : ''}`}>All ({reports.length})</button>
                                    <button onClick={() => setReportFilter('pending')} className={`filter-pill ${reportFilter === 'pending' ? 'active' : ''}`}>Pending ({pendingReportsCount})</button>
                                    <button onClick={() => setReportFilter('resolved')} className={`filter-pill ${reportFilter === 'resolved' ? 'active' : ''}`}>Resolved</button>
                                </div>
                            </div>

                            {filteredReports.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No reports found matching your filter.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
                                    {filteredReports.map(report => (
                                        <div key={report._id} className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: `4px solid ${report.status === 'pending' ? 'var(--danger)' : 'var(--success)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <span className="badge" style={{ background: report.status === 'pending' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: report.status === 'pending' ? 'var(--danger)' : 'var(--success)', marginBottom: '0.5rem', display: 'inline-block' }}>
                                                        {report.status.toUpperCase()}
                                                    </span>
                                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>
                                                        {report.itemId?.title ? (
                                                            <Link to={`/item/${report.itemId._id}`} target="_blank" style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                {report.itemId.title} <ExternalLink size={14} />
                                                            </Link>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>[Item Deleted]</span>
                                                        )}
                                                    </h3>
                                                </div>

                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '1rem' }}>
                                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                                                    <strong>Report Reason:</strong> {report.reason}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Reported by: <strong>{report.reportedBy?.name}</strong> ({report.reportedBy?.email})
                                                </p>
                                                {report.itemId?.postedBy && (
                                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        Posted by: <strong>{report.itemId.postedBy.name}</strong> ({report.itemId.postedBy.email})
                                                        {report.itemId.postedBy.blocked && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem', fontWeight: 'bold' }}>[USER BLOCKED]</span>}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {report.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateReportStatus(report._id, 'resolved')}
                                                        className="btn-primary"
                                                        style={{ background: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                    >
                                                        <CheckCircle2 size={14} /> Mark Resolved
                                                    </button>
                                                )}
                                                {report.itemId?._id && (
                                                    <button
                                                        onClick={() => handleDeleteItem(report.itemId._id)}
                                                        className="btn-secondary"
                                                        style={{ color: 'var(--danger)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                    >
                                                        <Trash2 size={14} /> Delete Reported Post
                                                    </button>
                                                )}
                                                {report.itemId?.postedBy?._id && !report.itemId.postedBy.blocked && (
                                                    <button
                                                        onClick={() => handleToggleBlockUser(report.itemId.postedBy._id)}
                                                        className="btn-secondary"
                                                        style={{ color: 'var(--warning)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                    >
                                                        <Lock size={14} /> Block Poster
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteReport(report._id)}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ITEM LISTINGS & SPAM */}
                    {activeTab === 'items' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ position: 'relative', width: '320px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search all items..."
                                        value={itemSearch}
                                        onChange={e => setItemSearch(e.target.value)}
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Showing {filteredItems.length} of {items.length} items
                                </span>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                {filteredItems.map(item => {
                                    const itemReports = reports.filter(r => (r.itemId?._id || r.itemId) === item._id);
                                    const hasAbuseReport = itemReports.length > 0;

                                    return (
                                        <div
                                            key={item._id}
                                            className="glass-card animate-fade-in"
                                            style={{
                                                padding: '1.25rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                border: hasAbuseReport ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border-color)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <span className={`badge badge-${item.type}`}>{item.type}</span>
                                                    <span className="badge" style={{ background: item.status === 'active' ? 'rgba(99,102,241,0.1)' : 'rgba(34,197,94,0.1)', color: item.status === 'active' ? 'var(--accent-primary)' : 'var(--success)' }}>
                                                        {item.status}
                                                    </span>
                                                </div>

                                                {hasAbuseReport && (
                                                    <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <AlertTriangle size={12} /> Flagged by {itemReports.length} user report(s)
                                                    </div>
                                                )}

                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                                                    <Link to={`/item/${item._id}`} style={{ color: 'var(--text-color)' }}>
                                                        {item.title}
                                                    </Link>
                                                </h4>

                                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                    {item.description.substring(0, 90)}...
                                                </p>

                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span>Location: {item.location}</span>
                                                    <span>Posted by: {item.postedBy?.name || 'Unknown'} ({item.postedBy?.email})</span>
                                                    <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                                                <Link
                                                    to={`/item/${item._id}`}
                                                    className="btn-secondary"
                                                    style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="btn-secondary"
                                                    style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                                                    title="Delete Item"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB: MEMBER MANAGEMENT */}
                    {activeTab === 'members' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ position: 'relative', width: '320px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search student members..."
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {members.length} registered students & moderators
                                </span>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                {filteredMembers.map(member => (
                                    <div
                                        key={member._id}
                                        className="glass-card animate-fade-in"
                                        style={{
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            border: member.blocked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{member.name}</h3>
                                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                                                    {member.email}
                                                </p>
                                            </div>
                                            <span className="badge" style={{ background: member.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.08)', color: member.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                                {member.role.toUpperCase()}
                                            </span>
                                        </div>

                                        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                            <span style={{ fontWeight: 'bold', color: member.blocked ? 'var(--danger)' : 'var(--success)' }}>
                                                {member.blocked ? 'BLOCKED' : 'ACTIVE'}
                                            </span>
                                        </div>

                                        {member._id !== user._id && (
                                            <button
                                                onClick={() => handleToggleBlockUser(member._id)}
                                                className="btn-secondary"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    color: member.blocked ? 'var(--success)' : 'var(--danger)',
                                                    borderColor: member.blocked ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                                }}
                                            >
                                                {member.blocked ? (
                                                    <>
                                                        <Unlock size={16} /> Unblock Student
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={16} /> Block Student
                                                    </>
                                                )}
                                            </button>
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
                                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                    "{claim.message}"
                                                </p>
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
