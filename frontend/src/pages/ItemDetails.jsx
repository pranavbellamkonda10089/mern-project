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
    const [claimMessage, setClaimMessage] = useState('');
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/items/${id}`);
                setItem(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchItem();
    }, [id]);

    const handleClaim = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`http://localhost:5000/api/items/${id}/claim`, { message: claimMessage }, config);
            setSuccess('Claim submitted successfully. The poster will review it.');
            setShowClaimForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting claim');
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
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
