import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, User, Info, MessageSquare } from 'lucide-react';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [item, setItem] = useState(null);
    const [messages, setMessages] = useState([]);
    const [claims, setClaims] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [claimMessage, setClaimMessage] = useState('');
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchItemAndMessages = async () => {
            try {
                const [itemRes, msgRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}`),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/messages`)
                ]);
                setItem(itemRes.data);
                setMessages(msgRes.data);

                // Fetch claims if user is the poster
                const posterId = itemRes.data.postedBy?._id || itemRes.data.postedBy;
                if (user && user._id === posterId) {
                    const claimsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`, { headers: { Authorization: `Bearer ${user.token}` } });
                    setClaims(claimsRes.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchItemAndMessages();
    }, [id, user]);

    const handleClaim = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`, { message: claimMessage }, config);
            setSuccess('Claim submitted successfully. The poster will review it.');
            setShowClaimForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting claim');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/messages`, { text: newMessage }, config);
            setMessages([...messages, data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message');
        }
    };

    const handleUpdateClaim = async (claimId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/claim/${claimId}`, { status: newStatus }, config);

            // Refetch claims and items to reflect changes
            const claimsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`, config);
            setClaims(claimsRes.data);
            const itemRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}`);
            setItem(itemRes.data);
        } catch (err) {
            console.error('Failed to update claim status');
        }
    };

    if (!item) return <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>Loading...</div>;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div
                    style={{
                        height: '350px',
                        background: `url(${item.photoUrl || 'https://images.unsplash.com/photo-1614728447814-74971c24ed6a'}) center/cover`,
                    }}
                />
                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <span className={`badge badge-${item.type}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>{item.type}</span>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.title}</h1>
                        </div>
                        <span className="badge" style={{ background: item.status === 'active' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: item.status === 'active' ? 'var(--accent-primary)' : 'var(--success)', border: `1px solid ${item.status === 'active' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(34, 197, 94, 0.2)'}` }}>
                            {item.status.toUpperCase()}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <Calendar size={20} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date</p>
                                <p style={{ fontWeight: '500' }}>{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <MapPin size={20} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location</p>
                                <p style={{ fontWeight: '500' }}>{item.location}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <User size={20} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Posted By</p>
                                <p style={{ fontWeight: '500' }}>{item.postedBy?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Info size={18} /> Description
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{item.description}</p>
                    </div>

                    {user && user._id !== (item.postedBy?._id || item.postedBy) && item.status === 'active' && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                            {!showClaimForm ? (
                                <button className="btn-primary" onClick={() => setShowClaimForm(true)} style={{ width: '100%', padding: '1rem' }}>
                                    <MessageSquare size={18} /> Claim this Item
                                </button>
                            ) : (
                                <form onSubmit={handleClaim} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Claim Verification</h4>
                                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                                    {item.type === 'found' && item.claimQuestion && (
                                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '4px', borderLeft: '4px solid var(--accent-primary)' }}>
                                            <strong style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Security Question:</strong>
                                            <p style={{ marginTop: '0.5rem' }}>{item.claimQuestion}</p>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Your Message / Answer</label>
                                        <textarea rows="3" placeholder="Explain why this is yours or answer the security question..." value={claimMessage} onChange={e => setClaimMessage(e.target.value)} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Claim</button>
                                        <button type="button" className="btn-secondary" onClick={() => setShowClaimForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            )}
                            {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>{success}</div>}
                        </div>
                    )}

                    {user && user._id === (item.postedBy?._id || item.postedBy) && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} /> Manage Claims ({claims.length})
                            </h3>
                            {claims.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No one has claimed this item yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {claims.map(claim => (
                                        <div key={claim._id} style={{ padding: '1.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', borderLeft: `4px solid ${claim.status === 'approved' ? 'var(--success)' : claim.status === 'rejected' ? 'var(--danger)' : 'var(--accent-primary)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{claim.claimantId?.name}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {claim.claimantId?.email}</p>
                                                </div>
                                                <span className={`badge`} style={{ background: 'rgba(0,0,0,0.1)', color: 'inherit' }}>{claim.status.toUpperCase()}</span>
                                            </div>
                                            <p style={{ margin: '0 0 1rem 0', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '4px', fontStyle: 'italic' }}>
                                                "{claim.message}"
                                            </p>
                                            {claim.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleUpdateClaim(claim._id, 'approved')} className="btn-primary" style={{ padding: '0.5rem 1rem', flex: 1, background: 'var(--success)', color: 'white' }}>Approve Claim</button>
                                                    <button onClick={() => handleUpdateClaim(claim._id, 'rejected')} className="btn-secondary" style={{ padding: '0.5rem 1rem', flex: 1, color: 'var(--danger)' }}>Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <MessageSquare size={18} /> Clarifications & Chat
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {messages.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No messages yet. Ask a question about this item!</p>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg._id} style={{ padding: '1rem', borderRadius: 'var(--radius)', background: user?._id === msg.sender?._id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)', alignSelf: user?._id === msg.sender?._id ? 'flex-end' : 'flex-start', minWidth: '250px', maxWidth: '80%' }}>
                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: user?._id === msg.sender?._id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                            {msg.sender?.name} {user?._id === msg.sender?._id && '(You)'}
                                        </p>
                                        <p style={{ margin: 0, lineHeight: '1.4' }}>{msg.text}</p>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', outline: 'none' }}
                                />
                                <button type="submit" className="btn-primary" disabled={!newMessage.trim()}>Send</button>
                            </form>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please log in to participate in the discussion.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
